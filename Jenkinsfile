pipeline {
  agent any

  environment {
    NETLIFY_AUTH_TOKEN = credentials('netlify-token')
  }

  stages {
    stage('Install Dependencies') {
      steps {
        bat 'npm install'
      }
    }

    stage('Build WebDriver Tests') {
      steps {
        bat 'mvn clean compile'
      }
    }

    stage('Start Local Server') {
      steps {
        bat 'start /B npx serve public -l 5000'
        bat 'timeout /t 5'
      }
    }

    stage('Run Tests') {
      steps {
        bat 'mvn test -DsiteUrl=http://localhost:5000'
      }
    }

    stage('Deploy to Netlify') {
      when {
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        bat """
          npx netlify deploy --prod --dir=public --auth=%NETLIFY_AUTH_TOKEN% --site=41be3028-d457-4a27-96ac-e645f00616ab
        """
      }
    }
  }
}
