import { create, IPFSHTTPClient } from "ipfs-http-client";

export default class IpfsUtils {
  ipfs: IPFSHTTPClient | undefined;

  getIpfs() {
    if (this.ipfs) {
      return this.ipfs;
    } else {
      const ipfs = create({
        url: "https://ipfs.infura.io:5001",
        headers: {
          authorization:
            "Basic MkR5czBaMnRKUUxuZEZGZ2pRSWd0T3VHeUVoOjJmOGNhNDVkNWI2Yzc3MDM2ZDBlNDhkOTQ1YzYxNGVh",
        },
      });
      this.ipfs = ipfs;
      return ipfs;
    }
  }

  async upload(text: string) {
    const added = await this.getIpfs().add(text);
    return added.path;
  }

  async download(id: string) {
    const chunks = [];

    for await (const chunk of this.getIpfs().cat(id)) {
      chunks.push(chunk);
    }
    return new TextDecoder().decode(chunks[0].buffer);
  }
}
