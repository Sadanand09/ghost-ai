import type { CanvasNode, CanvasEdge, NodeShape, NodeColor } from "@/types/canvas"
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

const color = (index: number): NodeColor => NODE_COLORS[index % NODE_COLORS.length]

const createNode = (
  id: string,
  label: string,
  shape: NodeShape,
  x: number,
  y: number,
  colorIndex: number = 0,
): CanvasNode => ({
  id,
  type: "canvasNode",
  position: { x, y },
  width: SHAPE_DEFAULT_SIZES[shape].width,
  height: SHAPE_DEFAULT_SIZES[shape].height,
  data: {
    label,
    shape,
    color: color(colorIndex),
  },
})

const createEdge = (id: string, source: string, target: string, label: string = ""): CanvasEdge => ({
  id,
  type: "canvasEdge",
  source,
  target,
  data: {
    label,
  },
})

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard microservices pattern with API Gateway, Auth, and independent services.",
    nodes: [
      createNode("gateway", "API Gateway", "rectangle", 100, 200, 1),
      createNode("auth", "Auth Service", "rectangle", 400, 100, 2),
      createNode("users", "User Service", "rectangle", 400, 200, 0),
      createNode("orders", "Order Service", "rectangle", 400, 300, 0),
      createNode("db-users", "Users DB", "cylinder", 700, 200, 4),
      createNode("db-orders", "Orders DB", "cylinder", 700, 300, 4),
    ],
    edges: [
      createEdge("e1", "gateway", "auth", "Verify"),
      createEdge("e2", "gateway", "users", "Routes"),
      createEdge("e3", "gateway", "orders", "Routes"),
      createEdge("e4", "users", "db-users"),
      createEdge("e5", "orders", "db-orders"),
    ],
  },
  {
    id: "serverless",
    name: "Serverless Web App",
    description: "Cloud-native architecture using Edge functions, serverless DB, and CDN.",
    nodes: [
      createNode("client", "Web Browser", "rectangle", 50, 200, 0),
      createNode("cdn", "Edge CDN", "pill", 300, 200, 1),
      createNode("auth", "Auth Provider", "rectangle", 300, 100, 2),
      createNode("functions", "Serverless Functions", "hexagon", 550, 200, 3),
      createNode("db", "Serverless DB", "cylinder", 800, 200, 4),
    ],
    edges: [
      createEdge("e1", "client", "cdn", "Requests"),
      createEdge("e2", "cdn", "auth", "Validate"),
      createEdge("e3", "cdn", "functions", "Invoke"),
      createEdge("e4", "functions", "db", "Query"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description: "Automated workflow from code commit to production deployment.",
    nodes: [
      createNode("source", "Source Code", "rectangle", 50, 150, 1),
      createNode("build", "Build & Test", "rectangle", 300, 150, 2),
      createNode("artifact", "Artifact Registry", "cylinder", 550, 150, 4),
      createNode("deploy-staging", "Staging", "hexagon", 300, 300, 7),
      createNode("deploy-prod", "Production", "hexagon", 550, 300, 6),
    ],
    edges: [
      createEdge("e1", "source", "build", "Push"),
      createEdge("e2", "build", "artifact", "Success"),
      createEdge("e3", "artifact", "deploy-staging", "Deploy"),
      createEdge("e4", "deploy-staging", "deploy-prod", "Promote"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Decoupled architecture using an event bus for asynchronous communication.",
    nodes: [
      createNode("producer", "Event Producer", "rectangle", 100, 200, 1),
      createNode("bus", "Event Bus / Kafka", "pill", 400, 200, 3),
      createNode("consumer-a", "Consumer A", "rectangle", 700, 100, 5),
      createNode("consumer-b", "Consumer B", "rectangle", 700, 200, 5),
      createNode("consumer-c", "Consumer C", "rectangle", 700, 300, 5),
    ],
    edges: [
      createEdge("e1", "producer", "bus", "Publish"),
      createEdge("e2", "bus", "consumer-a", "Subscribe"),
      createEdge("e3", "bus", "consumer-b", "Subscribe"),
      createEdge("e4", "bus", "consumer-c", "Subscribe"),
    ],
  },
  {
    id: "load-balancer",
    name: "High Availability Web",
    description: "Multi-region setup with Load Balancer and database replication.",
    nodes: [
      createNode("lb", "Load Balancer", "pill", 100, 200, 1),
      createNode("app1", "App Server (Primary)", "rectangle", 400, 120, 0),
      createNode("app2", "App Server (Secondary)", "rectangle", 400, 280, 0),
      createNode("db-primary", "Primary DB", "cylinder", 700, 120, 4),
      createNode("db-replica", "Read Replica", "cylinder", 700, 280, 4),
    ],
    edges: [
      createEdge("e1", "lb", "app1"),
      createEdge("e2", "lb", "app2"),
      createEdge("e3", "app1", "db-primary"),
      createEdge("app1-to-app2", "app1", "app2", "Failover"),
      createEdge("e4", "app2", "db-replica"),
      createEdge("e5", "db-primary", "db-replica", "Sync"),
    ],
  },
]
