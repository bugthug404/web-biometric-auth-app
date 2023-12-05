import {
  MongoClient,
  Db,
  Collection,
  InsertOneResult,
  Document,
} from "mongodb";

const url = process.env.MONGODB_URI || "";
const dbName = "webauthn";
const collectionName = "users";

class MongoDB {
  private client: MongoClient;
  private db!: Db;
  private collection!: Collection<Document>;

  constructor() {
    this.client = new MongoClient(url);
  }

  async connect() {
    console.log("connecting to url --- ", url);
    const connection = await this.client.connect();
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
    return connection;
  }

  async create(doc: Document): Promise<string> {
    const result: InsertOneResult<Document> = await this.collection.insertOne(
      doc
    );
    return result.insertedId.toHexString();
  }

  async read(query: Document): Promise<Array<Document>> {
    const docs = await this.collection.find(query).toArray();
    return docs;
  }

  async getUser(username: string): Promise<Document | null> {
    const doc = await this.collection.findOne({ username });

    return doc;
  }

  async update(query: Document, update: Document): Promise<number> {
    const result = await this.collection.updateOne(
      query,
      { $set: update },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      return result.upsertedCount;
    }
    return result.modifiedCount;
  }

  async delete(query: Document): Promise<number> {
    const result: any = await this.collection.deleteOne(query);
    return result;
  }

  async close() {
    await this.client.close();
  }
}

export default MongoDB;
