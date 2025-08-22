import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
dotenv.config();

const updateSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.DB);
        console.log('Connected to MongoDB');

        const result = await User.updateOne(
            { email: 'tobiasrahul58@gmail.com' },
            { $set: { mainrole: 'superadmin', role: 'admin' } }
        );

        console.log('Update result:', result);
        if (result.modifiedCount > 0) {
            console.log('Successfully updated user to superadmin');
        } else if (result.matchedCount === 0) {
            console.log('No user found with that email');
        } else {
            console.log('User found but no changes were needed');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateSuperAdmin();
