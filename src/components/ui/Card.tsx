import { useState } from "react";

export type CardItem = {
    name: string;
    title: string;
    description: string;
    image: string;
    price: string;
}

type CardProps = {
    title: string;
    items: CardItem[];
}

export default function Card() {

}