
var Person = require('../models/person');

var router = require('express').Router();


router.route('/persons')

    /*
        curl --header "Content-Type: application/json" \
        --request POST \
        --data '{"name":"Stella"}' \
        http://localhost:3030/v1/persons
     */

    // create a person (accessed at POST http://localhost:3030/v1/persons)
    .post(function (req, res) {

        var person = new Person();      // create a new instance of the person model
        person.name = req.body.name;  // set the person name (comes from the request)

        // save the bear and check for errors
        person.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Person created!' });
        });

    })

    // get all the persons (accessed at GET http://localhost:3030/v1/persons)
    .get(function (req, res) {
        Person.find(function (err, persons) {
            if (err)
                res.send(err);

            res.json(persons);
        });
    });

module.exports = router;