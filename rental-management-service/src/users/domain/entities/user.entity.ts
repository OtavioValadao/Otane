import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import { Document, HydratedDocument, ObjectId } from "mongoose";

export type UserDocument = HydratedDocument<UserEntity>;

@Schema()
export class UserEntity{

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    age: number;

    @Prop()
    bornDate: Date;

    @Prop()
    isActive: boolean;

    @Prop({ unique: true })
    cpf: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);