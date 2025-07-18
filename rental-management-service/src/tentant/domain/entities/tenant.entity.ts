import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TentantDocument = HydratedDocument<TenantEntity>;

@Schema()
export class TenantEntity {

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

export const UserSchema = SchemaFactory.createForClass(TenantEntity);