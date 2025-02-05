"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Heading } from "@/components/heading";
import { MessagesSquareIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constant";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ConversationPage = () => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values)
    }

    return (
        <div>
            <Heading
                title="Conversation"
                description="Our most advanced Conversation model. "
                icon={MessagesSquareIcon}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />

            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                            className="
                            rounded-lg
                            border
                            w-full
                            p-4
                            px-3
                            md:px-6
                            focus-within:shadow-sm
                            grid 
                            grid-cols-12
                            gap-2
                            ">
                            <FormField
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="How do I calculate the radius of a circle?"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            <Select>
                                <SelectTrigger className="col-span-12 lg:col-span-1 w-full">
                                    <SelectValue placeholder="Model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                                    <SelectItem value="GPT-4o-mini">GPT-4o-mini</SelectItem>
                                    <SelectItem value="Gemini">Gemini</SelectItem>
                                    <SelectItem value="Gork">Grok</SelectItem>
                                    <SelectItem value="Claude">Claude</SelectItem>
                                    <SelectItem value="LLama">LLama</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button className="col-span-12 lg:col-span-1 w-full" disabled={isLoading}>
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    Messages Content
                </div>
            </div>
        </div>
    );
}

export default ConversationPage;