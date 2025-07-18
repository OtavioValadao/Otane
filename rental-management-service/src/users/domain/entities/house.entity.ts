import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type HouseDocument = HydratedDocument<House>;

@Schema()
export class House {
    @Prop()
    address: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    zipCode: string;

    @Prop()
    country: string;

    @Prop()
    isAvailable: boolean;

    @Prop()
    price: number;

    @Prop()
    description: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    ownerId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    tenantIds: mongoose.Types.ObjectId;
}

export const HouseSchema = SchemaFactory.createForClass(House);