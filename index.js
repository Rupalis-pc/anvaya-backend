const { initializeDatabase } = require("./db/db.connect");
const express = require("express");
const Lead = require("./model/lead.model");
const Comment = require("./model/comment.model");
const SalesAgent = require("./model/salesAgent.model");
const Tag = require("./model/tag.model");

require("dotenv").config();

const PORT = process.env.PORT;

initializeDatabase();

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`App is running on server ${PORT}`);
});

//Fetch leads data
app.get("/leads", async (req, res) => {
  try {
    const leads = await Lead.find();

    if (leads.length > 0) {
      res.json(leads);
    } else {
      res.status(404).json({ error: "Lead Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads data." });
  }
});

//Post lead data
app.post("/leads", async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New lead data added to the Database", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: "Failed to post leads data." });
  }
});

//update lead data
app.post("/leads/:id", async (req, res) => {
  try {
    const updateLeadData = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (updateLeadData) {
      res.status(200).json({
        message: "Lead data updated successfully",
        lead: updateLeadData,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to post leads data.", error });
  }
});

// delete lead data
app.delete("/leads/:id", async (req, res) => {
  try {
    const deleteLeadData = await Lead.findByIdAndDelete(req.params.id);
    if (deleteLeadData) {
      res.status(200).json({
        message: "Lead data deleted successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lead data." });
  }
});

// add a comment to lead id
app.post("/leads/:id/comments", async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save(); // Save to DB
    res.status(201).json({
      message: "New comment added to the Lead",
      comment: newComment,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to add comment." });
  }
});

// get all comments to lead id
app.get("/leads/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find();

    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.status(404).json({ error: "Comment Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments data." });
  }
});

//fetch agents data
app.get("/agents", async (req, res) => {
  try {
    const agents = await SalesAgent.find();

    if (agents.length > 0) {
      res.json(agents);
    } else {
      res.status(404).json({ error: "Agent Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agents data." });
  }
});

//post agent data
app.post("/agents", async (req, res) => {
  try {
    const newLead = new SalesAgent(req.body);
    await newLead.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New lead data added to the Database", lead: newLead });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to post leads data." });
  }
});

//fetch tags data
app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find();

    if (tags.length > 0) {
      res.json(tags);
    } else {
      res.status(404).json({ error: "Tag Data not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags data." });
  }
});

//post tags data
app.post("/tags", async (req, res) => {
  try {
    const tags = new Tag(req.body);
    await tags.save(); // Save to DB

    res
      .status(201)
      .json({ message: "New tag data added to the Database", tags: tags });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to post tags data." });
  }
});
