import { Router } from "express";
import Employe from "../../models/Employe.js";
import Response, { Status } from "../../models/app/Response.js";
import { getEmployeSkills } from "../../services/api/employe/index.js";
import { authenticateManager, authenticateMechanic } from "../../middleware/authMiddleware.js";
import MyError from "../../models/app/MyError.js";

const employeRouter = Router();

const MESSAGES = {
  EMPLOYE_DELETED: "Employé supprimé",
  SKILLS_UPDATED: "Compétences mises à jour",
  SKILLS_REQUIRED: "Compétences requises",
};

employeRouter.get("/", authenticateManager, async (req, res) => {
  const employes = await Employe.find();
  res.status(200).json(new Response("", Status.Ok, employes));
});

employeRouter.get("/skills", authenticateMechanic, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const skills = await getEmployeSkills({ userId: _id });
    res.status(200).json(new Response("", Status.Ok, skills));
  } catch (error) {
    next(error);
  }
});

employeRouter.put("/skills", authenticateMechanic, async (req, res, next) => {
  try {
    const { _id } = req.user;
    if (!req.body.skills) throw new MyError(MESSAGES.SKILLS_REQUIRED, 400);
    const employe = await Employe.findOne({ id_user: _id });
    employe.skills = req.body.skills; // Update skills
    await employe.save();
    res.status(200).json(new Response(MESSAGES.SKILLS_UPDATED, Status.Ok, employe));
  } catch (error) {
    next(error);
  }
});

employeRouter.delete("/:id", async (req, res) => {
  await Employe.findByIdAndDelete(req.params.id);
  res.status(201).json(new Response(MESSAGES.EMPLOYE_DELETED, Status.Ok));
});

export default employeRouter;
