import UserModel from '@/resources/user/user.model';
import tokenModel from '@/resources/token/token.model';

class UserService {
    private user = UserModel;
    private token = tokenModel;

    /**
     * Attempt to get all users
     */
    public async getUsers(): Promise<any> {
        try {
            const users = await this.user.find();

            return { status: 'success', users };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to get all users');
        }
    }

    /**
     * Attempt to get one user by Id
     */
    public async getUserById(id: string): Promise<any> {
        try {
            const user = await this.user.findById(id);

            return user;
        } catch (error: any) {
            throw new Error(error.message || 'Unable to get a user');
        }
    }

    /**
     * Attempt update a user by Id
     */
    public async updateUserById(id: string, body: Body): Promise<any> {
        try {
            const user = await this.user.findByIdAndUpdate(id, { ...body }, { new: true });

            return user;
        } catch (error: any) {
            throw new Error(error.message || 'Unable to update a user');
        }
    }

    /**
     * Attempt to delete a user by Id
     */
    public async deleteUserById(id: string): Promise<any> {
        try {
            const user = await this.user.findByIdAndDelete(id);

            // Delete Confirm Email for delete
            if (user) await this.token.findOneAndDelete({ _userId: user });

            return user;
        } catch (error: any) {
            throw new Error(error.message || 'Unable to delete a user');
        }
    }
}

export default UserService;
