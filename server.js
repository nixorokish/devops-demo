const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

app.use(express.json())

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.use(cors())

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '47611782c30e47db960bc80520ab333c',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.log('Someone requested the student list.')
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
           res.status(400).send('You must enter a name.')
       } else {
           res.status(400).send('That student already exists.')
       }
       rollbar.info('Someone added a student')
   } catch (err) {
       console.log(err)
       rollbar.error(`${err} triggered in the post request to api/students`)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
    rollbar.log('Someone deleted a student')
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
