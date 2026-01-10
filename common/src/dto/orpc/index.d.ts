export declare const api: {
    blogPosts: {
        getBlogPosts: import("@orpc/contract").ContractProcedure<import("zod").ZodObject<{
            query: import("zod").ZodString;
            after: import("zod").ZodOptional<import("zod").ZodString>;
            tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            minDate: import("zod").ZodOptional<import("zod").ZodDate>;
            maxDate: import("zod").ZodOptional<import("zod").ZodDate>;
        }, "strip", import("zod").ZodTypeAny, {
            query: string;
            after?: string | undefined;
            tags?: string[] | undefined;
            minDate?: Date | undefined;
            maxDate?: Date | undefined;
        }, {
            query: string;
            after?: string | undefined;
            tags?: string[] | undefined;
            minDate?: Date | undefined;
            maxDate?: Date | undefined;
        }>, import("zod").ZodObject<{
            posts: import("zod").ZodArray<import("zod").ZodObject<{
                url: import("zod").ZodString;
                icon: import("zod").ZodNullable<import("zod").ZodUnion<[import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"external">;
                    external: import("zod").ZodObject<{
                        url: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
                        url: string;
                    }, {
                        url: string;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "external";
                    external: {
                        url: string;
                    };
                }, {
                    type: "external";
                    external: {
                        url: string;
                    };
                }>, import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"emoji">;
                    emoji: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "emoji";
                    emoji: string;
                }, {
                    type: "emoji";
                    emoji: string;
                }>, import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"custom_emoji">;
                    custom_emoji: import("zod").ZodObject<{
                        name: import("zod").ZodString;
                        url: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
                        url: string;
                        name: string;
                    }, {
                        url: string;
                        name: string;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
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
                }>, import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"file">;
                    file: import("zod").ZodObject<{
                        url: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
                        url: string;
                    }, {
                        url: string;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
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
                properties: import("zod").ZodObject<{
                    "Publish Date": import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"date">;
                        date: import("zod").ZodObject<{
                            start: import("zod").ZodDate;
                            end: import("zod").ZodNullable<import("zod").ZodDate>;
                        }, "strip", import("zod").ZodTypeAny, {
                            start: Date;
                            end: Date | null;
                        }, {
                            start: Date;
                            end: Date | null;
                        }>;
                    }, "strip", import("zod").ZodTypeAny, {
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
                    Title: import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"title">;
                        title: import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"text">;
                            text: import("zod").ZodObject<{
                                content: import("zod").ZodString;
                                link: import("zod").ZodNullable<import("zod").ZodObject<{
                                    url: import("zod").ZodString;
                                }, "strip", import("zod").ZodTypeAny, {
                                    url: string;
                                }, {
                                    url: string;
                                }>>;
                            }, "strip", import("zod").ZodTypeAny, {
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
                            annotations: import("zod").ZodObject<{
                                bold: import("zod").ZodBoolean;
                                italic: import("zod").ZodBoolean;
                                strikethrough: import("zod").ZodBoolean;
                                underline: import("zod").ZodBoolean;
                                code: import("zod").ZodBoolean;
                                color: import("zod").ZodUnion<[import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>, import("zod").ZodEnum<["default_background", "gray_background", "brown_background", "orange_background", "yellow_background", "green_background", "blue_background", "purple_background", "pink_background", "red_background"]>]>;
                            }, "strip", import("zod").ZodTypeAny, {
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
                        }, "strip", import("zod").ZodTypeAny, {
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
                        }>, import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"mention">;
                        }, "strip", import("zod").ZodTypeAny, {
                            type: "mention";
                        }, {
                            type: "mention";
                        }>, import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"equation">;
                        }, "strip", import("zod").ZodTypeAny, {
                            type: "equation";
                        }, {
                            type: "equation";
                        }>]>, "many">;
                    }, "strip", import("zod").ZodTypeAny, {
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
                    Tags: import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"multi_select">;
                        multi_select: import("zod").ZodArray<import("zod").ZodObject<{
                            name: import("zod").ZodString;
                            color: import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
                        }, "strip", import("zod").ZodTypeAny, {
                            name: string;
                            color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                        }, {
                            name: string;
                            color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                        }>, "many">;
                    }, "strip", import("zod").ZodTypeAny, {
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
                    Status: import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"status">;
                        status: import("zod").ZodNullable<import("zod").ZodObject<{
                            name: import("zod").ZodEnum<[string, string, string, string]>;
                            color: import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
                        }, "strip", import("zod").ZodTypeAny, {
                            name: string;
                            color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                        }, {
                            name: string;
                            color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                        }>>;
                    }, "strip", import("zod").ZodTypeAny, {
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
                }, "strip", import("zod").ZodTypeAny, {
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
            }, "strip", import("zod").ZodTypeAny, {
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
            }>, "many">;
            pageInfo: import("zod").ZodObject<{
                hasNextPage: import("zod").ZodBoolean;
                nextCursor: import("zod").ZodNullable<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                hasNextPage: boolean;
                nextCursor: string | null;
            }, {
                hasNextPage: boolean;
                nextCursor: string | null;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
            posts: {
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
            }[];
            pageInfo: {
                hasNextPage: boolean;
                nextCursor: string | null;
            };
        }, {
            posts: {
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
            }[];
            pageInfo: {
                hasNextPage: boolean;
                nextCursor: string | null;
            };
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getBlogPost: import("@orpc/contract").ContractProcedure<import("zod").ZodObject<{
            name: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>, import("zod").ZodObject<{
            url: import("zod").ZodString;
            icon: import("zod").ZodNullable<import("zod").ZodUnion<[import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"external">;
                external: import("zod").ZodObject<{
                    url: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    url: string;
                }, {
                    url: string;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                type: "external";
                external: {
                    url: string;
                };
            }, {
                type: "external";
                external: {
                    url: string;
                };
            }>, import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"emoji">;
                emoji: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                type: "emoji";
                emoji: string;
            }, {
                type: "emoji";
                emoji: string;
            }>, import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"custom_emoji">;
                custom_emoji: import("zod").ZodObject<{
                    name: import("zod").ZodString;
                    url: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    url: string;
                    name: string;
                }, {
                    url: string;
                    name: string;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
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
            }>, import("zod").ZodObject<{
                type: import("zod").ZodLiteral<"file">;
                file: import("zod").ZodObject<{
                    url: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    url: string;
                }, {
                    url: string;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
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
            properties: import("zod").ZodObject<{
                "Publish Date": import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"date">;
                    date: import("zod").ZodObject<{
                        start: import("zod").ZodDate;
                        end: import("zod").ZodNullable<import("zod").ZodDate>;
                    }, "strip", import("zod").ZodTypeAny, {
                        start: Date;
                        end: Date | null;
                    }, {
                        start: Date;
                        end: Date | null;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
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
                Title: import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"title">;
                    title: import("zod").ZodArray<import("zod").ZodUnion<[import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"text">;
                        text: import("zod").ZodObject<{
                            content: import("zod").ZodString;
                            link: import("zod").ZodNullable<import("zod").ZodObject<{
                                url: import("zod").ZodString;
                            }, "strip", import("zod").ZodTypeAny, {
                                url: string;
                            }, {
                                url: string;
                            }>>;
                        }, "strip", import("zod").ZodTypeAny, {
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
                        annotations: import("zod").ZodObject<{
                            bold: import("zod").ZodBoolean;
                            italic: import("zod").ZodBoolean;
                            strikethrough: import("zod").ZodBoolean;
                            underline: import("zod").ZodBoolean;
                            code: import("zod").ZodBoolean;
                            color: import("zod").ZodUnion<[import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>, import("zod").ZodEnum<["default_background", "gray_background", "brown_background", "orange_background", "yellow_background", "green_background", "blue_background", "purple_background", "pink_background", "red_background"]>]>;
                        }, "strip", import("zod").ZodTypeAny, {
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
                    }, "strip", import("zod").ZodTypeAny, {
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
                    }>, import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"mention">;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "mention";
                    }, {
                        type: "mention";
                    }>, import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"equation">;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "equation";
                    }, {
                        type: "equation";
                    }>]>, "many">;
                }, "strip", import("zod").ZodTypeAny, {
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
                Tags: import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"multi_select">;
                    multi_select: import("zod").ZodArray<import("zod").ZodObject<{
                        name: import("zod").ZodString;
                        color: import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        name: string;
                        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                    }, {
                        name: string;
                        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                    }>, "many">;
                }, "strip", import("zod").ZodTypeAny, {
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
                Status: import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"status">;
                    status: import("zod").ZodNullable<import("zod").ZodObject<{
                        name: import("zod").ZodEnum<[string, string, string, string]>;
                        color: import("zod").ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        name: string;
                        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                    }, {
                        name: string;
                        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
                    }>>;
                }, "strip", import("zod").ZodTypeAny, {
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
            }, "strip", import("zod").ZodTypeAny, {
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
        }, "strip", import("zod").ZodTypeAny, {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, {
            NOT_FOUND: {
                message: string;
                status: number;
            };
        }>>>, Record<never, never>>;
    };
};
