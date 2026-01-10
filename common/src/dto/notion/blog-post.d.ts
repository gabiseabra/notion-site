import { z } from "zod";
export declare const BlogPost: z.ZodObject<{
    url: z.ZodString;
    icon: z.ZodNullable<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"external">;
        external: z.ZodObject<{
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
        }, {
            url: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "external";
        external: {
            url: string;
        };
    }, {
        type: "external";
        external: {
            url: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"emoji">;
        emoji: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "emoji";
        emoji: string;
    }, {
        type: "emoji";
        emoji: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"custom_emoji">;
        custom_emoji: z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
        }, {
            url: string;
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "custom_emoji";
        custom_emoji: {
            url: string;
            name: string;
        };
    }, {
        type: "custom_emoji";
        custom_emoji: {
            url: string;
            name: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"file">;
        file: z.ZodObject<{
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
        }, {
            url: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "file";
        file: {
            url: string;
        };
    }, {
        type: "file";
        file: {
            url: string;
        };
    }>]>>;
    properties: z.ZodObject<{
        "Publish Date": z.ZodObject<{
            type: z.ZodLiteral<"date">;
            date: z.ZodObject<{
                start: z.ZodDate;
                end: z.ZodNullable<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                start: Date;
                end: Date | null;
            }, {
                start: Date;
                end: Date | null;
            }>;
        }, "strip", z.ZodTypeAny, {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        }, {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        }>;
        Title: z.ZodObject<{
            type: z.ZodLiteral<"title">;
            title: z.ZodArray<z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"text">;
                text: z.ZodObject<{
                    content: z.ZodString;
                    link: z.ZodNullable<z.ZodObject<{
                        url: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        url: string;
                    }, {
                        url: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                }, {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                }>;
                annotations: z.ZodObject<{
                    bold: z.ZodBoolean;
                    italic: z.ZodBoolean;
                    strikethrough: z.ZodBoolean;
                    underline: z.ZodBoolean;
                    code: z.ZodBoolean;
                    color: z.ZodUnion<[z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>, z.ZodEnum<["default_background", "gray_background", "brown_background", "orange_background", "yellow_background", "green_background", "blue_background", "purple_background", "pink_background", "red_background"]>]>;
                }, "strip", z.ZodTypeAny, {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                }, {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                }>;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            }, {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            }>, z.ZodObject<{
                type: z.ZodLiteral<"mention">;
            }, "strip", z.ZodTypeAny, {
                type: "mention";
            }, {
                type: "mention";
            }>, z.ZodObject<{
                type: z.ZodLiteral<"equation">;
            }, "strip", z.ZodTypeAny, {
                type: "equation";
            }, {
                type: "equation";
            }>]>, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        }, {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        }>;
        Tags: z.ZodObject<{
            type: z.ZodLiteral<"multi_select">;
            multi_select: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }, {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        }, {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        }>;
        Status: z.ZodObject<{
            type: z.ZodLiteral<"status">;
            status: z.ZodNullable<z.ZodObject<{
                name: z.ZodEnum<[string, string, string, string]>;
                color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }, {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        }, {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        "Publish Date": {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        };
        Title: {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        };
        Tags: {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        };
        Status: {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        };
    }, {
        "Publish Date": {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        };
        Title: {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        };
        Tags: {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        };
        Status: {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    url: string;
    icon: {
        type: "external";
        external: {
            url: string;
        };
    } | {
        type: "emoji";
        emoji: string;
    } | {
        type: "custom_emoji";
        custom_emoji: {
            url: string;
            name: string;
        };
    } | {
        type: "file";
        file: {
            url: string;
        };
    } | null;
    properties: {
        "Publish Date": {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        };
        Title: {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        };
        Tags: {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        };
        Status: {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        };
    };
}, {
    url: string;
    icon: {
        type: "external";
        external: {
            url: string;
        };
    } | {
        type: "emoji";
        emoji: string;
    } | {
        type: "custom_emoji";
        custom_emoji: {
            url: string;
            name: string;
        };
    } | {
        type: "file";
        file: {
            url: string;
        };
    } | null;
    properties: {
        "Publish Date": {
            type: "date";
            date: {
                start: Date;
                end: Date | null;
            };
        };
        Title: {
            type: "title";
            title: ({
                type: "mention";
            } | {
                type: "equation";
            } | {
                type: "text";
                text: {
                    content: string;
                    link: {
                        url: string;
                    } | null;
                };
                annotations: {
                    code: boolean;
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "default_background" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
                };
            })[];
        };
        Tags: {
            type: "multi_select";
            multi_select: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            }[];
        };
        Status: {
            type: "status";
            status: {
                name: string;
                color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
            } | null;
        };
    };
}>;
export type BlogPost = z.infer<typeof BlogPost>;
