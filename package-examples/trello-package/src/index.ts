import { NodeBase, NodeConfig, NodeInput, NodeReturn } from "core-package-mini-n8n"
import axios from "axios"

class TrelloNode extends NodeBase {
    constructor(state: any) {
        super(state);
    }

    getConfig(): NodeConfig {
        return {
            name: "trello-node-mini-n8n", // Name e type needs to be the same
            type: "trello-node-mini-n8n", // Name e type needs to be the same
            description: "Trello Node",
            properties: [
                {
                    label: "Token",
                    name: "token",
                    type: "text",
                    required: true,
                    default: null
                },
                {
                    label: "Api key",
                    name: "apiKey",
                    type: "text",
                    required: true,
                    default: ""
                },
                {
                    label: "Operations",
                    name: "operation",
                    type: "select",
                    required: true,
                    default: "getMyBoards",
                    options: [
                        {
                            label: "My boards",
                            value: "getMyBoards"
                        },
                        {
                            label: "Get lists from board by id",
                            value: "getListsFromBoardById"
                        },
                        {
                            label: "Get cards from list by id",
                            value: "getCardsFromListById"
                        },
                        {
                            label: "Create a card",
                            value: "createCard"
                        }
                    ],
                }, 
                {
                    label: "Board id",
                    name: "boardId",
                    type: "text",
                    required: false,
                    default: "",
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "getListsFromBoardById"
                        }
                    ]
                },
                {
                    label: "List id",
                    name: "listId",
                    type: "text",
                    required: false,
                    default: "",
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "getCardsFromListById"
                        }
                    ]
                },
                {
                    label: "List id",
                    name: "listId",
                    type: "text",
                    required: false,
                    default: "",
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "createCard"
                        }
                    ]
                },
                {
                    label: "Name",
                    name: "cardName",
                    type: "text",
                    required: false,
                    default: "",
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "createCard"
                        }
                    ]
                },
                {
                    label: "Description",
                    name: "description",
                    type: "textarea",
                    required: false,
                    default: "",
                    conditionShow: [
                        {
                            keyCheck: "operation",
                            valueExpected: "createCard"
                        }
                    ]
                }
            ]
        }
    }

    async execute(node: NodeInput): Promise<NodeReturn> {
        const setting = node.settings;

        if (
            !setting.token ||
            !setting.apiKey ||
            !setting.operation) {
            throw new Error("Invalid settings. You need to provide a token, apiKey and operation");
        }

        setting.apiKey = this.parseExpression(setting.apiKey.trim());
        setting.token = this.parseExpression(setting.token.trim());
        
        if (setting.operation === "getMyBoards") {
            const response = await axios.get(
                `https://api.trello.com/1/members/me/boards?key=${setting.apiKey}&token=${setting.token}`);
            return { ok: true, data: response.data };
        }

        if (setting.operation === "getListsFromBoardById") {
            if (!setting.boardId) {
                throw new Error("Invalid settings. You need to provide a board id");
            }


            const response = await axios.get(
                this.parseExpression(`https://api.trello.com/1/boards/${setting.boardId}/lists?key=${setting.apiKey}&token=${setting.token}`));
            return { ok: true, data: response.data };
        }

        if (setting.operation === "getCardsFromListById") {
            if (!setting.listId) {
                throw new Error("Invalid settings. You need to provide a list id");
            }

            const response = await axios.get(
                this.parseExpression(`https://api.trello.com/1/lists/${setting.listId}/cards?key=${setting.apiKey}&token=${setting.token}`));
            return { ok: true, data: response.data };
        }

        if (setting.operation === "createCard") {
            if (!setting.listId || !setting.cardName || !setting.description) {
                throw new Error("Invalid settings. You need to provide a list id, cardName and description");
            }

            const response = await axios.post(
                this.parseExpression(`https://api.trello.com/1/cards?key=${setting.apiKey}&token=${setting.token}&idList=${setting.listId}&name=${setting.cardName}&desc=${setting.description}`));
            return { ok: true, data: response.data };
        }


        throw new Error("Operation not found")


    }
}

export default TrelloNode;
