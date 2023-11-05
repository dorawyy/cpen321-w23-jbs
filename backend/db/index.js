import mongoose from 'mongoose';
import User from './user.model.js';
import Appointment from './appointment.model.js';
import Conversation from './conversation.model.js';
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = User
db.appointment = Appointment
db.conversation = Conversation

export default db;