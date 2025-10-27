pipeline {
  agent any
  options {
    timestamps()         // 로그에 시간 표시
    ansiColor('xterm')   // 컬러 출력
  }

  environment {
    REPO_DIR = '/home/ubuntu/repos/duckon'           // EC2 내 클론 경로
    COMPOSE_FILE = 'docker-compose.dev.yml'          // 사용할 Compose 파일
    BRANCH_NAME = 'develop'                          // 빌드 대상 브랜치
  }

  stages {

    stage('Checkout') {
      steps {
        echo "📦 Checking out source from GitLab..."
        checkout([
          $class: 'GitSCM',
          branches: [[name: "*/${env.BRANCH_NAME}"]],
          userRemoteConfigs: [[
            url: 'https://lab.ssafy.com/s13-final/S13P31A406.git',
            credentialsId: 'git_token'   // Jenkins Credentials에 등록된 GitLab Token ID
          ]]
        ])
      }
    }

    stage('Build & Deploy') {
      steps {
        echo "🚀 Building and Deploying containers..."
        sh """
          cd ${REPO_DIR}
          docker compose -f ${COMPOSE_FILE} pull || true
          docker compose -f ${COMPOSE_FILE} up -d --build
        """
      }
    }

    stage('Health Check') {
      steps {
        echo "🔍 Checking backend health..."
        sh """
          sleep 10
          STATUS_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || true)
          if [ "\$STATUS_CODE" = "200" ]; then
            echo "✅ Backend is healthy!"
          else
            echo "❌ Backend health check failed with code \$STATUS_CODE"
            exit 1
          fi
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deploy success!"
    }
    failure {
      echo "❌ Deploy failed! Check Jenkins logs."
    }
  }
}
