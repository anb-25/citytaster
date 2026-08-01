#cloud-config
package_update: true
packages:
  - awscli
runcmd:
  - curl -fsSL https://get.docker.com | sh
  - systemctl enable --now docker
  - mkdir -p /home/ubuntu/app
