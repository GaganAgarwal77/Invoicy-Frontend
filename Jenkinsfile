pipeline {
    agent any

    environment
    {
        registry = "gaganagarwal77/invoicy-frontend"
        registryCredential = "dockerhub"
        dockerImage = ""
    }

    stages {
        stage('Pull GitHub') {
            steps {
                git branch: 'main', credentialsId: '20323', url: 'https://github.com/GaganAgarwal77/Invoicy-Frontend/'
            }
        }
        stage('Docker Image Build') {
            steps {
                script {
                    dockerImage = docker.build(registry + ":latest")
                }
            }
        }
        stage('DockerHub Image Push') {
            steps {
                script {
                    docker.withRegistry('', registryCredential) {
                        dockerImage.push()
                    }
                }
            }
        }
        stage('Ansible Deployment') {
            steps {
                ansiblePlaybook colorized: true,
                installation: 'Ansible',
                inventory: 'inventory',
                playbook: 'playbook.yml'
            }
        }
    }
}