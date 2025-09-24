/**
 * Purpose: One EC2 (t3.micro) that runs Docker Compose with:
 *  - mongo
 *  - backend (Flask)  → exposed internally on 5000
 *  - frontend (nginx) → exposed internally on 80
 *  - nginx (reverse proxy) listening on port 80 publicly:
 *      /    → frontend
 *      /api → backend
 *
 * Why: This replaces paid ALB/EKS for dev while keeping your Docker workflow.
 */
import { Construct } from "constructs";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamInstanceProfile } from "@cdktf/provider-aws/lib/iam-instance-profile";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";

export interface Ec2ComposeProps {
  name: string;
  subnetId: string;
  sgIds: string[];
  region: string;
  keyName?: string;
  backendImage: string;
  frontendImage: string;
  dbName: string;
}

export class Ec2Compose extends Construct {
  readonly ec2: Instance;

  constructor(scope: Construct, id: string, p: Ec2ComposeProps) {
    super(scope, id);

    const role = new IamRole(this, "role", {
      name: `${p.name}-role`,
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Principal: { Service: "ec2.amazonaws.com" }, Action: "sts:AssumeRole" }]
      })
    });

    [
      "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
      "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
    ].forEach((arn, i) => new IamRolePolicyAttachment(this, `attach${i}`, { role: role.name, policyArn: arn }));

    const profile = new IamInstanceProfile(this, "profile", { name: `${p.name}-profile`, role: role.name });

    const userData = `#cloud-config
package_update: true
packages:
  - docker
  - awscli
runcmd:
  - systemctl enable --now docker
  - curl -L https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
  - chmod +x /usr/local/bin/docker-compose
  - aws ecr get-login-password --region ${p.region} | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.${p.region}.amazonaws.com
  - mkdir -p /opt/app
  - cat > /opt/app/nginx.conf <<'NGINX'
server {
  listen 80;
  location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  location /api/ {
    proxy_pass http://backend:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
NGINX

  - cat > /opt/app/docker-compose.yaml <<'EOF'
version: "3.9"
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes: [ "mongo_data:/data/db" ]

  backend:
    image: ${p.backendImage}
    restart: unless-stopped
    environment:
      - MONGO_URL=mongodb://mongo:27017/${p.dbName}
      - PYTHONUNBUFFERED=1
    depends_on: [ mongo ]
    expose: [ "5000" ]

  frontend:
    image: ${p.frontendImage}
    restart: unless-stopped
    expose: [ "80" ]

  nginx:
    image: nginx:1.25-alpine
    depends_on: [ backend, frontend ]
    volumes:
      - /opt/app/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports: [ "80:80" ]

volumes:
  mongo_data: {}
EOF
  - docker-compose -f /opt/app/docker-compose.yaml up -d
`;

    this.ec2 = new Instance(this, "ec2", {
      ami: "ami-08c40ec9ead489470",     // Amazon Linux 2023 us-east-1
      instanceType: "t3.micro",
      subnetId: p.subnetId,
      vpcSecurityGroupIds: p.sgIds,
      keyName: p.keyName || undefined,
      iamInstanceProfile: profile.name,
      userDataBase64: Buffer.from(userData).toString("base64"),
      tags: { Name: p.name }
    });
  }
}
