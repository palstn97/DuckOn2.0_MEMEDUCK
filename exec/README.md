# MemeDuck 포팅 매뉴얼 (Docker & GitLab Runner)

> 이 문서는 GitLab 저장소를 클론한 뒤, 동일한 인프라에서 **빌드·배포**할 수 있도록 정리한 포팅 매뉴얼입니다.  
> 운영/개발 환경 모두 Docker 기반으로 구성되며, **Nginx 리버스 프록시 하에 Backend(API)만 공개**됩니다.  
> 프론트는 **React + Vite (웹)**, 모바일은 **Capacitor 앱**으로 구동됩니다.

---

## 0) 시스템 개요

* **서비스명:** *MemeDuck – 라이브 방송 & 밈 생성·공유 플랫폼*
* **아키텍처:**  
  CloudFront ↔ S3(정적 웹) ↔ 브라우저/앱  
  Nginx(리버스 프록시) ↔ **Back(Spring Boot)** ↔ RDS(MySQL), DocumentDB(Mongo), ElastiCache(Redis), OpenSearch, S3/CloudFront
  *웹 프론트는 S3/CloudFront에 정적 배포, 모바일 앱은 Capacitor로 스토어 배포. 서버에는 **/api, WebSocket 엔드포인트만 노출***  
* **배포 방식:** GitLab Runner on EC2, Docker 컨테이너 실행 (원격 SSH 스크립트)
* **백엔드 API 엔드포인트 예:**  
  `https://duckon.site/api/...`

---

## 1) 개발 도구·런타임 버전 및 설정

### 1.1 IDE & 언어/런타임

* **Backend IDE:** IntelliJ IDEA (권장 최신)
* **Java:** **JDK 17**
* **Spring Boot:** 3.x (실제 버전은 `build.gradle` 참고)
* **Gradle:** **Wrapper 사용(Yes)** – 레포 내 `gradlew`

* **Frontend(Web/App):**
  * **React:** 19.1.0
  * **Vite:** 7.0.4
  * **TypeScript:** ~5.8.3
  * **Capacitor:** 7.4.4
  * **React Router:** 7.7.0
  * **상태/통신:** `@tanstack/react-query`, `axios`, `zustand`
  * **애니메이션/UX:** `framer-motion`, `@headlessui/react`, `lucide-react`
  * **실시간:** `@stomp/stompjs`, `sockjs-client`, `socket.io-client`
  * **스타일링:** Tailwind CSS 4.x

> 이 프로젝트는 **React SPA + Capacitor 앱** 구조입니다.  
> 서버 측 Nginx는 `/api` 및 WebSocket 경로 위주로 프록시를 설정하며, 정적 웹은 S3/CloudFront에 위치합니다.

### 1.2 웹서버 / WAS

* **Reverse Proxy:** `nginx:alpine` (또는 `nginx:latest`)
* **WAS:** Spring Boot 내장 Tomcat (포트 **8080** – 컨테이너 내부)

### 1.3 DB/스토리지/캐시

* **MySQL(RDS):** 8.x (RDS 엔드포인트 사용, 포트 **3306**)
* **Redis(ElastiCache 또는 Docker):** 7.x (기본 포트 **6379**, VPC 내부 사용)
* **DocumentDB(Mongo 호환):** 4.x대 (Mongo 호환, 기본 포트 **27017/27018**)
* **Object Storage:**  **AWS S3** + **CloudFront**

  * 일반 업로드 S3 버킷: `duckon-bucket`
  * 밈 이미지 S3 버킷:
    * dev: `memeduck-memes-dev`
    * prod: `memeduck-memes-prod`
  * 밈 CDN:
    * dev: `https://dn9z1o6i8w44p.cloudfront.net`
    * prod: `https://d23breqm38jov9.cloudfront.net`

---

## 2) 빌드 시 사용되는 환경변수

> 실제 값은 **환경변수/CI 변수**로 주입하세요.  
> Git에 민감정보를 넣지 말고, **키 이름만 고정**해서 사용합니다.

### 2.1 Backend (Spring Boot)

#### 2.1a `application.properties` 매핑 (민감정보 삭제형)

```properties
spring.application.name=DuckOn-Back

# --- Server Port ---
server.port=8080

# --- Database (MySQL) ---
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# --- Redis ---
spring.data.redis.host=${REDIS_HOST}
spring.data.redis.port=${REDIS_PORT}

# --- JPA ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# --- OAuth2 ---
app.frontend.oauth2-success-url=${BASE_URL}/oauth2/success
app.frontend.oauth2-failure-url=${BASE_URL}/oauth2/failure

spring.security.oauth2.client.registration.google.client-id=${GOOGLE_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_SECRET}
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.google.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.client-authentication-method=client_secret_basic

spring.security.oauth2.client.registration.kakao.client-id=${KAKAO_ID}
spring.security.oauth2.client.registration.kakao.client-secret=${KAKAO_SECRET}
spring.security.oauth2.client.registration.kakao.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.kakao.client-authentication-method=client_secret_post
spring.security.oauth2.client.registration.kakao.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.kakao.scope=profile_nickname

spring.security.oauth2.client.registration.naver.client-id=${NAVER_ID}
spring.security.oauth2.client.registration.naver.client-secret=${NAVER_SECRET}
spring.security.oauth2.client.registration.naver.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.naver.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.naver.scope=name,email,profile_image
spring.security.oauth2.client.registration.naver.client-authentication-method=client_secret_basic

spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://openidconnect.googleapis.com/v1/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub

spring.security.oauth2.client.provider.kakao.authorization-uri=https://kauth.kakao.com/oauth/authorize
spring.security.oauth2.client.provider.kakao.token-uri=https://kauth.kakao.com/oauth/token
spring.security.oauth2.client.provider.kakao.user-info-uri=https://kapi.kakao.com/v2/user/me
spring.security.oauth2.client.provider.kakao.user-name-attribute=id

spring.security.oauth2.client.provider.naver.authorization-uri=https://nid.naver.com/oauth2.0/authorize
spring.security.oauth2.client.provider.naver.token-uri=https://nid.naver.com/oauth2.0/token
spring.security.oauth2.client.provider.naver.user-info-uri=https://openapi.naver.com/v1/nid/me
spring.security.oauth2.client.provider.naver.user-name-attribute=response

# --- JWT ---
jwt.secret=${JWT_SECRET}
jwt.access-exp=${JWT_ACCESS_EXP:900}
jwt.refresh-exp=${JWT_REFRESH_EXP:1209600}

# --- S3 (일반 업로드) ---
aws.s3.access-key=${S3_ACCESS_KEY}
aws.s3.secret-key=${S3_SECRET_KEY}
aws.s3.region=${S3_REGION}
aws.s3.bucket-name=${S3_BUCKET_NAME}

# --- Meme S3 / CDN ---
meme.s3.bucket=${MEME_S3_BUCKET}
meme.cdn.base-url=${MEME_CDN_BASE_URL}

# --- Multipart 설정 ---
spring.servlet.multipart.max-file-size=30MB
spring.servlet.multipart.max-request-size=30MB
server.tomcat.max-part-count=100
server.tomcat.max-swallow-size=30MB
server.tomcat.max-http-form-post-size=30MB

# --- MongoDB / DocumentDB ---
spring.data.mongodb.uri=${MONGO_DB_URL}
spring.data.mongodb.username=${MONGO_DB_USERNAME}
spring.data.mongodb.password=${MONGO_DB_PASSWORD}
spring.data.mongodb.database=${MONGO_DB_NAME}

# --- Blacklist (JWT 블랙리스트 등) ---
security.blacklist.hmac-secret=${BLACKLIST_HMAC_SECRET}
security.blacklist.key-prefix=blacklist:

# --- 인코딩 ---
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true

# --- Translate Service ---
translate.base-url=${TRANSLATE_BASE_URL}
translate.timeout-ms=${TRANSLATE_TIMEOUT_MS}

# --- Spring Mail ---
spring.mail.host=${SMTP_SERVER}
spring.mail.port=${SMTP_PORT}
spring.mail.username=${SMTP_ID}
spring.mail.password=${SMTP_PW}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=${SMTP_SSL:false}
spring.mail.properties.mail.smtp.starttls.enable=${SMTP_STARTTLS:true}

service.mail.from=${FROM_EMAIL}
service.mail.brand=${MAIL_BRAND:DUCKON}
service.email.code.ttl-seconds=${EMAIL_CODE_TTL_SECONDS:600}
service.email.code.length=${EMAIL_CODE_LENGTH:6}
service.email.rate-limit.send.per-10m=${EMAIL_SEND_PER_10M:5}
service.email.rate-limit.verify.per-1h=${EMAIL_VERIFY_PER_1H:10}
service.email.code.consume-on-success=${EMAIL_CONSUME_ON_SUCCESS:true}

# --- OpenSearch ---
opensearch.endpoint=${OPENSEARCH_ENDPOINT}
opensearch.region=${OPENSEARCH_REGION}

# --- Youtube API Key ---
youtube.api.key=${YOUTUBE_API_KEY}

# --- OpenAI ---
openai.api-key=${OPENAI_API_KEY}
openai.model=${OPENAI_MODEL:gpt-5-nano}

3) 빌드 & 패키징 절차
3.1 Backend
# 1) 소스 클론
$ git clone <GITLAB_REPO_URL> memeduck
$ cd memeduck/backend
$ git checkout master   # 또는 main/prod 브랜치

# 2) JDK 17 확인 후 빌드
$ chmod +x gradlew
$ ./gradlew clean build -x test
# 산출물: backend/build/libs/*.jar

# 3) Docker 이미지 빌드 (prod 예시)
$ docker build -t duckonback:prod .

3.2 Frontend (React + Vite + Capacitor)
# 로컬 개발자 용
$ cd memeduck/frontend
$ npm install

# .env
VITE_API_BASE_URL=https://duckon.site/api

# 개발 서버
$ npm run dev   # http://localhost:5173 등

# 정적 빌드 (S3 업로드 산출물)
$ npm run build
# 산출물: frontend/dist/ → S3 정적 호스팅에 업로드

# Capacitor 앱 (선택)
$ npx cap sync
# 이후 Android Studio / Xcode에서 빌드 및 스토어 배포

4) 런타임(배포) 구성
4.1 현재/예상 컨테이너 구성
- duckon-proxy         (nginx 리버스 프록시) :80
- duckon-app-prod      (spring)             :8080 (프록시 뒤)
- redis (또는 elasticache)                 :6379 (내부만)
- mysql (RDS 사용 시 로컬 컨테이너 생략)
- mongo (DocumentDB 사용 시 로컬 컨테이너 생략)


실제 운영은 **프록시 뒤의 백엔드 컨테이너 하나(duckon-app-prod)**만 활성 권장.
테스트용 백엔드 컨테이너가 있다면 포트 충돌 및 리소스 낭비 방지를 위해 종료/정리합니다.

4.2 Nginx 리버스 프록시 설정 예시

/etc/nginx/conf.d/duckon.conf

server {
    listen 80;
    server_name duckon.site;

    # 업로드 제한
    client_max_body_size 30m;

    # API 프록시
    location /api {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://duckon-app-prod:8080;
    }

    # (선택) 헬스 경로 노출
    location /actuator/health {
        proxy_pass http://duckon-app-prod:8080/actuator/health;
    }

    # (선택) WebSocket/STOMP 경로
    # location /ws {
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection "Upgrade";
    #     proxy_set_header Host $host;
    #     proxy_pass http://duckon-app-prod:8080;
    # }
}

4.3 Docker 실행 예시 (단일 노드)
# 네트워크 준비
$ docker network create duckon-net || true

# 백엔드 컨테이너 (prod 예시)
$ docker rm -f duckon-app-prod || true
$ docker run -d --name duckon-app-prod \
  --network duckon-net \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL \
  -e SPRING_DATASOURCE_USERNAME=$SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD \
  -e REDIS_HOST=$REDIS_HOST \
  -e REDIS_PORT=$REDIS_PORT \
  -e MONGO_DB_URL=$MONGO_DB_URL \
  -e MONGO_DB_NAME=$MONGO_DB_NAME \
  duckonback:prod

# 프록시 컨테이너
$ docker rm -f duckon-proxy || true
$ docker run -d --name duckon-proxy \
  --network duckon-net \
  -p 80:80 \
  -v /etc/nginx/conf.d:/etc/nginx/conf.d:ro \
  nginx:alpine


운영 환경에서는 8080을 호스트에 직접 노출하지 않고, Nginx만 80/443을 외부에 개방하는 구성을 추천합니다.

4.4 배포 시 특이사항

CORS

웹: https://duckon.site

앱(Capacitor): capacitor://localhost 등
위 도메인들을 Spring Security CORS 허용 오리진에 등록해야 합니다.

HTTPS

실제 서비스에서는 443/TLS(예: Let’s Encrypt/certbot, ACM)를 사용해야 쿠키/보안 기능 제약이 줄어듭니다.

보안 그룹 / 네트워크

RDS, DocumentDB, ElastiCache는 VPC 내부에서만 접근 가능하게 설정

EC2 + Nginx만 80/443 포트 공개

CloudFront/S3

Web은 CloudFront+S3에서 정적 제공

밈 이미지 등은 S3 업로드 후 CloudFront URL로 제공 (MEME_CDN_BASE_URL + object key)

5) GitLab CI/CD

브랜치 전략 (예시)

develop / dev 브랜치:

build → deploy(dev)

dev용 EC2에 SSH 접속, duckonback:dev 빌드 및 duckon-app-dev 컨테이너 재기동

master 브랜치:

build → deploy(prod)

prod용 EC2에 SSH 접속, duckonback:prod 빌드 및 duckon-app-prod 재기동

원격 스크립트 주요 동작

/home/$USER/memeduck에 레포 클론/업데이트

duckon-net 네트워크 생성(이미 있으면 통과)

backend/Dockerfile로 이미지 빌드

기존 컨테이너(duckon-app-dev 또는 duckon-app-prod) 종료 후 새 이미지로 컨테이너 기동

헬스체크: http://127.0.0.1:8080/actuator/health 또는 /api/actuator/health 에서 200/401 허용

운영 전환 시에는 master 전용 잡(duckonback:prod, 포트 바인딩 최소화 + 프록시 뒤 운용)으로 분리하여, dev/prod가 섞이지 않도록 구성하는 것을 권장합니다.

6) 프로젝트 설정 파일 & 비밀 관리

Backend

src/main/resources/application.properties
→ 환경변수 기반 ${KEY} placeholder만 유지 (민감정보 직접 기입 금지)

(필요 시) application-dev.properties, application-prod.properties
→ 공통 설정 + 프로필별 차이만 정의

Infra

/etc/nginx/conf.d/duckon.conf – 리버스 프록시 설정

(선택) docker-compose.yml – 로컬 개발/테스트용

기타

DB 초기 스키마/덤프: /exec/db/* 등 (있을 경우)

모든 시크릿(JWT, DB PW, S3 키, OAuth 클라이언트 시크릿, OpenAI Key 등)은

GitLab → Settings → CI/CD → Variables 에 등록해서 사용

7) 외부 서비스 사용 정리
7.1 AWS S3/CloudFront

버킷:

일반 업로드: duckon-bucket

밈 이미지:

dev: memeduck-memes-dev

prod: memeduck-memes-prod

CDN:

dev: https://dn9z1o6i8w44p.cloudfront.net

prod: https://d23breqm38jov9.cloudfront.net

사용 방식:

Backend가 이미지/파일을 S3에 업로드

클라이언트에는 MEME_CDN_BASE_URL + object key 형태의 URL 제공

7.2 OAuth2 (소셜 로그인)

지원 로그인: Google, Kakao, Naver

환경변수:

GOOGLE_ID, GOOGLE_SECRET

KAKAO_ID, KAKAO_SECRET

NAVER_ID, NAVER_SECRET

Redirect URI 패턴:

{BASE_URL}/login/oauth2/code/{registrationId}
예) https://duckon.site/login/oauth2/code/google

7.3 OpenAI API

용도: 번역/AI 기능

환경변수:

OPENAI_API_KEY

OPENAI_MODEL (예: gpt-5.1, 기본값 gpt-5-nano)

특징: 서버-사이드에서만 호출 (클라이언트에 키 노출 금지)

7.4 Youtube IFRAME API

용도: 방송/영상 재생

환경변수: YOUTUBE_API_KEY

프론트 사용: react-youtube 또는 직접 IFRAME 삽입

7.5 Translation Service

내부 번역 API:

Base URL: TRANSLATE_BASE_URL=http://<HOST>:8089

Timeout: TRANSLATE_TIMEOUT_MS=15000

OpenAI 번역과 조합하여 사용 가능

7.6 Mail (Gmail SMTP)

용도: 이메일 인증 코드 발송, 알림 메일

환경변수:

SMTP_SERVER, SMTP_PORT

SMTP_ID, SMTP_PW

SMTP_SSL, SMTP_STARTTLS

FROM_EMAIL, MAIL_BRAND

EMAIL_CODE_TTL_SECONDS, EMAIL_CODE_LENGTH, EMAIL_SEND_PER_10M, EMAIL_VERIFY_PER_1H

8) 의존성 요약
Backend

Core:

spring-boot-starter-web

spring-boot-starter-data-jpa

mysql-connector-j

Security/Validation:

spring-boot-starter-security

spring-boot-starter-validation

spring-boot-starter-oauth2-client

JWT:

io.jsonwebtoken:jjwt-*

Cache/실시간:

spring-boot-starter-data-redis

WebSocket/STOMP 관련 의존성 (필요 시)

Data:

spring-boot-starter-data-mongodb (또는 spring-data-mongodb)

OpenSearch Java Client

Infra/연동:

AWS SDK for S3

기타:

spring-boot-starter-mail

spring-boot-starter-actuator

Lombok, test 의존성 등