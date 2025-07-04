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

    stage('Deploy to Netlify') {
      steps {
        bat """
          npx netlify deploy --prod --dir=public --auth=%NETLIFY_AUTH_TOKEN% --site=41be3028-d457-4a27-96ac-e645f00616ab
        """
      }
    }
  }
}