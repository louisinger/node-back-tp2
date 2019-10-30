const express = require('express')
const fs = require('fs')
const bodyparser = require('body-parser')

const app = express()

app.use(bodyparser.urlencoded( {extended: false} ))
app.use(bodyparser.json())
app.set('view engine', 'ejs')

let calendar = []

function sendNotFoundError(res) {
    res.status(404).send('Not found (404)')
}

fs.readFile('./assets/calendar.json', 'utf8', (err, data) => {
    if (err) throw err
    calendar = JSON.parse(data).map(event => {
        event.start = new Date(event.start)
        event.end = new Date(event.end)
        return event
     })
});


app.get('/', (req, res) => {
	res.render('index', {calendar: calendar})
})

app.get('/api/event/', (req, res) => {
    const ids = calendar.map(event => event.id)
    res.send(ids)
})

app.get('/api/event/:id', (req, res) => {
    if (!req.params.id) {
        console.error('Error: need id parameter')
        sendNotFoundError(res)
    }

    const event = calendar.find(event => event.id == req.params.id)
    console.log(event)

    if (!event) {
        console.error('Error: the event', req.params.id, ' has been not found in the events calendar')
        sendNotFoundError(res)
    }

    res.send(event)
})

app.post('/api/event/', (req, res) => {
    const event = req.body
    if (!event) {
        res.status(400).send('No body')
        console.error('There are no body')
    }

    event.start = new Date('2005-06-07' + ' ' + event.start)
    event.end = new Date('2005-06-07' + ' ' + event.end)
    
    event.id = Math.max(...calendar.map(e => parseInt(e.id))) + 1

    console.log(event.id)
    console.log(event)
    calendar.push(event)
	res.render('index', {calendar: calendar})
})

app.post('/api/event/:id', (req, res) => {
    const newEvent = req.body
    if (!newEvent) {
        res.status(400).send('No body')
        console.error('There are no body')
    }

    if (!req.params.id) {
        sendNotFoundError(res)
        console.error('no id')
    }
    
    const event = calendar.find(event => event.id == req.params.id)
    if (!event) {
        sendNotFoundError(res)
        console.error('no event')
    }

    if (newEvent.title) event.title = newEvent.title
    if (newEvent.start) event.start = newEvent.start
    if (newEvent.end) event.end = newEvent.end
    if (newEvent.owner) event.owner = newEvent.owner
    res.send('The event has been updated')
})



app.listen(3000, () => {
  console.log('Application démarrée sur le port 3000!');
});

