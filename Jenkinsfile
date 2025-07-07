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

    stage('Run Tests') {
      steps {
        bat 'mvn test'
      }
    }

    stage('Deploy to Netlify') {
      when {
        expression {
          // Only deploy if tests succeeded
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
