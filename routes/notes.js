const express = require('express')
const router = express.Router()
const fetchUser = require('../Middleware/fetchUser');
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');

// fetchAllNotes endpoint
router.get('/fetchAllNotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.send(notes)
    } catch (error) {
        console.log(error);
       return res.status(500).send("Error occured")
    }
})

//InsertNote endpoint

try {
    router.post('/insertNotes', fetchUser, [
        body('title', 'Enter a valid title').isLength({ min: 3,max: 50}),
        body('description', 'Enter a valid valid description').isLength({ min: 5,max:135}),
    ], async (req, res) => {
        let success =false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({success,error:errors.array() });
        }
        const { title, description, tag } = req.body
        const notes = new Notes({
            title, description, tag, user: req.user.id
        })
        const snote = await notes.save();
        success=true;
        res.json({success,snote});
    })
} catch (error) {
    console.log(error);
    return res.send({success,error:[{msg:"Error Occured"}]})
}


// updateNote endpoint


try {
    router.put('/updateNote/:id', fetchUser, [
        body('title', 'Enter a valid title').isLength({ min: 3,max: 50}),
        body('description', 'Enter a valid valid description').isLength({ min: 5,max:135 }),
    ], async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({success,error:errors.array()});
        }
        const { title, description, tag } = req.body
        let newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.json({success, error: [{msg:"Not Found"}] })
        }

        if (note.user.toString() !== req.user.id) {
            return res.json({success,error: [{msg:"Not Allowed"}] })
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        success=true;
        res.send({success,note});

    })
} catch (error) {
    console.log(error);
    return res.send({success,error:[{msg:"Error Occured"}]})
}


// delteNote


try {
    router.delete('/deleteNote/:id', fetchUser, async (req, res) => {
        let success = false;
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.json({success,error: "Not Found" })
        }

        if (note.user.toString() !== req.user.id) {
            return res.json({success,error: "Not allowed" })
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        success=true;
        res.json({success,note: note});

    })
} catch (error) {
    console.log(error);
    return res.send({success,error:"Error occured"})
}



module.exports = router