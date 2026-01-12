import Fastify from "fastify";
import formbody from "@fastify/formbody";
import view from "@fastify/view";
import handlebars from "handlebars";
import postgres from "@fastify/postgres";

// Optional overrides let tests inject a fake pg client or silence logging.
export async function buildApp(options = {}) {
  const {
    logger = true,
    pgClient,
    databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres@localhost/postgres",
  } = options;

  const app = Fastify({ logger });

  if (pgClient) {
    // Allow tests to bypass a real database connection.
    app.decorate("pg", pgClient);
  } else {
    await app.register(postgres, {
      connectionString: databaseUrl,
    });
  }

  await app.register(formbody);
  await app.register(view, {
    engine: { handlebars: handlebars },
    root: new URL("./views/", import.meta.url).pathname,
  });

  // Health check endpoint
  app.get("/health", async () => ({ ok: true }));

  // Get all quotes endpoint
  app.get("/", async (_req, reply) => {
    const result = await app.pg.query("SELECT * FROM quotes");
    const quotes = result.rows;

    return reply.view("index.hbs", { quotes });
  });

  // Post new quote endpoint
  app.post("/quotes", async (req, reply) => {
    const author = (req.body?.author ?? "").trim();
    const text = (req.body?.text ?? "").trim();

    if (!text) {
      // Keep it simple: redirect back
      return reply.redirect("/");
    }

    await app.pg.query("INSERT INTO quotes (author, text) VALUES ($1, $2)", [
      author || "anonymous",
      text,
    ]);

    app.log.info(
      { quote: { author: author || "anonymous", text } },
      "New quote added",
    );

    return reply.redirect("/");
  });

  return app;
}
