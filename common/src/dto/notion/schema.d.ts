import { z } from "zod";
export declare const external: z.ZodObject<{
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
}>;
export declare const emoji: z.ZodObject<{
    type: z.ZodLiteral<"emoji">;
    emoji: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "emoji";
    emoji: string;
}, {
    type: "emoji";
    emoji: string;
}>;
export declare const custom_emoji: z.ZodObject<{
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
}>;
export declare const file: z.ZodObject<{
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
}>;
export declare const icon: z.ZodUnion<[z.ZodObject<{
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
}>]>;
export declare const mention: z.ZodObject<{
    type: z.ZodLiteral<"mention">;
}, "strip", z.ZodTypeAny, {
    type: "mention";
}, {
    type: "mention";
}>;
export declare const equation: z.ZodObject<{
    type: z.ZodLiteral<"equation">;
}, "strip", z.ZodTypeAny, {
    type: "equation";
}, {
    type: "equation";
}>;
export declare const unsupported: z.ZodUnion<[z.ZodObject<{
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
}>]>;
export declare const number: z.ZodObject<{
    type: z.ZodLiteral<"number">;
    number: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    number: number | null;
    type: "number";
}, {
    number: number | null;
    type: "number";
}>;
export declare const text: z.ZodObject<{
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
}>;
export declare const title: z.ZodObject<{
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
export declare const rich_text: z.ZodObject<{
    type: z.ZodLiteral<"rich_text">;
    rich_text: z.ZodArray<z.ZodUnion<[z.ZodObject<{
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
    type: "rich_text";
    rich_text: ({
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
    type: "rich_text";
    rich_text: ({
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
export declare function status<T extends [string, ...string[]]>(options: T): z.ZodObject<{
    type: z.ZodLiteral<"status">;
    status: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"status">;
    status: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_4 ? { [k in keyof T_4]: T_4[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_5 ? { [k_1 in keyof T_5]: T_5[k_1]; } : never>>;
}>, any> extends infer T_3 ? { [k_2 in keyof T_3]: T_3[k_2]; } : never, z.baseObjectInputType<{
    type: z.ZodLiteral<"status">;
    status: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_7 ? { [k in keyof T_7]: T_7[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_8 ? { [k_1 in keyof T_8]: T_8[k_1]; } : never>>;
}> extends infer T_6 ? { [k_3 in keyof T_6]: T_6[k_3]; } : never>;
export declare const _select: z.ZodObject<{
    type: z.ZodLiteral<"select">;
    select: z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
    }, {
        name: string;
        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "select";
    select: {
        name: string;
        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
    } | null;
}, {
    type: "select";
    select: {
        name: string;
        color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
    } | null;
}>;
export declare function select<T extends [string, ...string[]]>(options: T): z.ZodObject<{
    type: z.ZodLiteral<"select">;
    select: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"select">;
    select: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_4 ? { [k in keyof T_4]: T_4[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_5 ? { [k_1 in keyof T_5]: T_5[k_1]; } : never>>;
}>, any> extends infer T_3 ? { [k_2 in keyof T_3]: T_3[k_2]; } : never, z.baseObjectInputType<{
    type: z.ZodLiteral<"select">;
    select: z.ZodNullable<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_7 ? { [k in keyof T_7]: T_7[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_8 ? { [k_1 in keyof T_8]: T_8[k_1]; } : never>>;
}> extends infer T_6 ? { [k_3 in keyof T_6]: T_6[k_3]; } : never>;
export declare const _multi_select: z.ZodObject<{
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
export declare function multi_select<T extends [string, ...string[]]>(options: T): z.ZodObject<{
    type: z.ZodLiteral<"multi_select">;
    multi_select: z.ZodArray<z.ZodObject<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "multi_select";
    multi_select: (z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }>, any> extends infer T_3 ? { [k in keyof T_3]: T_3[k]; } : never)[];
}, {
    type: "multi_select";
    multi_select: (z.baseObjectInputType<{
        name: z.ZodEnum<z.Writeable<T>>;
        color: z.ZodEnum<["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]>;
    }> extends infer T_4 ? { [k_1 in keyof T_4]: T_4[k_1]; } : never)[];
}>;
export declare const date: z.ZodObject<{
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
export declare const checkbox: z.ZodObject<{
    type: z.ZodLiteral<"checkbox">;
    checkbox: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "checkbox";
    checkbox: boolean;
}, {
    type: "checkbox";
    checkbox: boolean;
}>;
