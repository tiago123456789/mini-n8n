"use client";

import { useState, useEffect } from "react";
import { X, Trash, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NodeConfigPanel({ node, onChange, onClose }) {
  const [config, setConfig] = useState({ ...node.data });
  const [headers, setHeaders] = useState<Array<{ [key: string]: any }>>([{}]);
  const [body, setBody] = useState<Array<{ [key: string]: any }>>([{}]);

  const [condition, setCondition] = useState(
    node.data.condition || {
      left: "",
      operator: "",
      right: "",
    }
  );

  const addBody = () => {
    const registers = [...body];
    registers.push({ key: "", type: "", value: "" });
    setBody([...registers]);
  };

  const removeBody = (index: number) => {
    if (body.length == 1) return;
    const registers = [...body];
    registers.splice(index, 1);
    setBody([...registers]);
  };

  const addHeader = () => {
    const registers = [...headers];
    registers.push({ key: "", type: "", value: "" });
    setHeaders([...registers]);
  };

  const removeHeader = (index: number) => {
    if (headers.length == 1) return;
    const registers = [...headers];
    registers.splice(index, 1);
    setHeaders([...registers]);
  };

  const onChangeBody = (index: number, key: string, value: any) => {
    body[index][key] = value;
    setBody([...body]);
  };

  const onChangeHeader = (index: number, key: string, value: any) => {
    headers[index][key] = value;
    setHeaders([...headers]);
  };

  useEffect(() => {
    setConfig(node.data);
    if (node.data && node.data.headers && node.data.headers.length > 0)
      setHeaders(node.data.headers);
    if (node.data && node.data.body && node.data.body.length > 0)
      setBody(node.data.body);
  }, [node]);

  const handleChange = (field, value) => {
    const newConfig = {
      ...config,
      headers: [...headers],
      body: [...body],
      [field]: value,
    };
    setConfig(newConfig);
    onChange(node.id, newConfig);
  };

  const renderWebhookConfig = () => <></>;

  const renderApiConfig = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="endpoint">API Endpoint</Label>
        <Input
          id="endpoint"
          value={config.endpoint || ""}
          onChange={(e) => handleChange("endpoint", e.target.value)}
          placeholder="https://api.example.com/data"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="method">HTTP Method</Label>
        <Select
          value={config.method || "GET"}
          onValueChange={(value) => handleChange("method", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="headers">Headers (JSON)</Label>
        {headers.map((item, index) => {
          return (
            <div key={index} className="grid grid-cols-6 gap-1">
              <div>
                <Label>Key</Label>
                <Input
                  value={item.key}
                  onChange={(e) => onChangeHeader(index, "key", e.target.value)}
                />
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  value={item.value}
                  onChange={(e) =>
                    onChangeHeader(index, "value", e.target.value)
                  }
                />
              </div>
              <div className="py-3">
                <Select
                  value={item.type}
                  onValueChange={(value) =>
                    onChangeHeader(index, "type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expression">Expressão</SelectItem>
                    <SelectItem value="raw">Sem expressão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-14 py-3">
                <Button onClick={() => removeHeader(index)}>
                  <Trash />
                </Button>
              </div>
              <div className="px-1 py-3">
                <Button onClick={() => addHeader()}>
                  <PlusCircle />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Request Body (JSON)</Label>
        {body.map((item, index) => {
          return (
            <div key={index} className="grid grid-cols-6 gap-1">
              <div>
                <Label>Key</Label>
                <Input
                  value={item.key}
                  onChange={(e) => onChangeBody(index, "key", e.target.value)}
                />
              </div>

              <div>
                <Label>Value</Label>
                <Input
                  value={item.value}
                  onChange={(e) => onChangeBody(index, "value", e.target.value)}
                />
              </div>
              <div className="py-3">
                <Select
                  value={item.type}
                  onValueChange={(value) => onChangeBody(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expression">Expressão</SelectItem>
                    <SelectItem value="raw">Sem expressão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-13 py-3">
                <Button onClick={() => removeBody(index)}>
                  <Trash />
                </Button>
              </div>
              <div className="py-3">
                <Button
                  onClick={() => {
                    addBody();
                  }}
                >
                  <PlusCircle />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <Button
          onClick={() => {
            handleChange("headers", headers);
            handleChange("body", body);
            setBody([{}]);
            setHeaders([{}]);
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </>
  );

  const renderConditionConfig = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="condition">Condition Expression</Label>

        <div key={1} className="grid grid-cols-3">
          <div className="py-6">
            <Label></Label>
            <Input
              value={condition.left}
              onChange={(e) =>
                setCondition({ ...condition, left: e.target.value })
              }
            />
          </div>

          <div>
            <div className="px-2 space-y-2">
              <Label htmlFor="method">Condição</Label>
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  setCondition({ ...condition, operator: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="==">Igual</SelectItem>
                  <SelectItem value=">">Maior que</SelectItem>
                  <SelectItem value="<">Menor que</SelectItem>
                  <SelectItem value="!=">Diferente</SelectItem>
                  <SelectItem value=">=">Maior que ou igual</SelectItem>
                  <SelectItem value="<=">Menor que ou igual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-1 py-6">
            <Label></Label>
            <Input
              value={condition.right}
              onChange={(e) =>
                setCondition({ ...condition, right: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => {
                handleChange("condition", condition);
                setCondition({});
                setConfig(null);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  const renderCodeConfig = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="code">JavaScript Code</Label>
        <textarea
          onChange={(e) => handleChange("code", e.target.value)}
          rows={15}
          cols={55}
        >
          {config.code}
        </textarea>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        <p>
          The function will run in a Deno environment, so to import library you
          can do something like:{" "}
          <strong>import a from "npm:library_name"</strong>
        </p>
        <p>
          You need to declara a function named <strong>node</strong>
        </p>
        <p>
          The function needs to return a object, even you don't need to return
          something you need to return empty object.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Params(Json format)</Label>
        <textarea
          rows={5}
          cols={55}
          value={config.params}
          onChange={(e) => handleChange("params", e.target.value)}
        >
          {JSON.stringify(config.params)}
        </textarea>
      </div>
      <div className="space-y-2">
        <Button
          onClick={() => {
            handleChange("condition", condition);
            setCondition({});
            setConfig(null);
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </>
  );

  return (
    <div className="w-150 border-l bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Configure {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Node Type</Label>
          <Input
            id="label"
            value={config.label || ""}
            disabled={true}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Step Name</Label>
          <Input
            id="name"
            value={config.name || ""}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value.replace(/ /g, "_").toLowerCase()
              )
            }
            placeholder="Enter a descriptive name for this step"
          />
        </div>
        {node.type === "webhook" && renderWebhookConfig()}
        {node.type === "api" && renderApiConfig()}
        {node.type === "condition" && renderConditionConfig()}
        {node.type === "code" && renderCodeConfig()}
      </div>
    </div>
  );
}
