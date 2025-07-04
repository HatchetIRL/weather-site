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
        bat '''
          npx netlify deploy --prod --dir=public --auth=$NETLIFY_AUTH_TOKEN --site=jimweather
        '''
      }
    }
  }
}