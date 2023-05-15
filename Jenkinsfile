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
        stage('Setup nvm') {
            steps {
                nvm("v14.17.3") {
                    sh '''
                        node -v
                    '''
                }
            }
        }
        stage('Install node package modules') {
            steps {
                nvm("v14.17.3") {
                    sh '''
                        npm install
                    '''
                }
            }
        }
        stage('Run tests') {
            steps {
                nvm("v14.17.3") {
                    sh '''
                        npm test
                    '''
                }
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