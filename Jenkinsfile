pipeline {
  agent any

  environment {
    NETLIFY_AUTH_TOKEN = credentials('netlify-token')
  }

  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Deploy to Netlify') {
      steps {
        sh '''
          npx netlify deploy --prod --dir=public --auth=$NETLIFY_AUTH_TOKEN --site=jimweather
        '''
      }
    }
  }
}