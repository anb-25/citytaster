#cloud-config
package_update: true
packages:
  - docker
  - awscli
runcmd:
  - systemctl enable --now docker
  - curl -L https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
  - chmod +x /usr/local/bin/docker-compose
  - mkdir -p /home/ec2-user/app
