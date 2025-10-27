pipeline {
  agent any
  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    REPO_DIR     = "${WORKSPACE}"              // 🔧 여기만 변경
    COMPOSE_FILE = "docker-compose.dev.yml"
    BRANCH_NAME  = "develop"
    BE_SERVICE   = "backend"
    BE_HEALTH_URL = "http://localhost:8080/actuator/health"
  }

  stages {
    // ✅ 이 스테이지는 아예 없애도 됩니다. 이미 위에서 체크아웃 완료됨.
    // stage('Checkout') {
    //   steps { checkout scm }
    // }

    stage('Build & Deploy') {
      steps {
        echo "🚀 Building and Deploying containers..."
        dir("${REPO_DIR}") {
          sh """
            docker compose -f ${COMPOSE_FILE} pull || true
            docker compose -f ${COMPOSE_FILE} up -d --build
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        echo "🔍 Checking backend health..."
        dir("${REPO_DIR}") {
          sh """
            set -e
            RETRIES=12
            i=0
            until [ \$i -ge \$RETRIES ]; do
              STATUS=\$(docker compose -f ${COMPOSE_FILE} exec -T ${BE_SERVICE} \
                sh -lc "curl -s -o /dev/null -w '%{http_code}' ${BE_HEALTH_URL}" || true)
              echo "Health HTTP status: \$STATUS"
              if [ "\$STATUS" = "200" ]; then
                echo "✅ Backend is healthy!"
                exit 0
              fi
              i=\$((i+1))
              sleep 5
            done
            echo "❌ Backend health check failed"
            exit 1
          """
        }
      }
    }
  }

  post {
    success { echo "✅ Deploy success!" }
    failure { echo "❌ Deploy failed! Check Jenkins logs." }
  }
}
