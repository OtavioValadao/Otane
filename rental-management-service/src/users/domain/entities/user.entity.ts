import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserEntity>;

@Schema()
export class UserEntity {

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