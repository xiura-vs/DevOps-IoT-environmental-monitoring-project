pipeline {
    agent any

    stages {
        stage('Build Backend (Maven)') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests -B'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}