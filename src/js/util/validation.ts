import { FormEvent } from "react";

export function numberFieldValidation(event: FormEvent<HTMLInputElement>) {
    let element = event.target as HTMLInputElement;
    if (element == null) {
        return;
    }
    element.value = element.value.replace(/\D/g, '');
}
