// Server-side GitHub committer for the admin panel. The repo is the CMS:
// publishing an article = committing its MDX + images to main, which
// triggers the normal hosting rebuild.
//
// Env: GITHUB_TOKEN (fine-grained PAT, contents read/write on this repo),
//      GITHUB_REPO (owner/name, defaults to JamesBaisus/The-Human-Thread),
//      GITHUB_BRANCH (defaults to main).

const API = "https://api.github.com";

const repo = () => process.env.GITHUB_REPO || "JamesBaisus/The-Human-Thread";
const branch = () => process.env.GITHUB_BRANCH || "main";

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function gh(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "tht-admin-panel",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init?.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export type CommitFile = { path: string; content: Buffer | string };

/** Lists filenames in content/articles/ on the target branch. */
export async function listArticleFiles(): Promise<string[]> {
  const items = await gh(`/repos/${repo()}/contents/content/articles?ref=${branch()}`);
  return (items as { name: string }[]).map((i) => i.name).filter((n) => /\.mdx?$/.test(n));
}

/** Lists filenames in an arbitrary repo directory; [] if the directory doesn't exist. */
export async function listDir(path: string): Promise<string[]> {
  try {
    const items = await gh(`/repos/${repo()}/contents/${encodeURI(path)}?ref=${branch()}`);
    return (items as { name: string }[]).map((i) => i.name);
  } catch {
    return [];
  }
}

/** Fetches a text file's content from the target branch. */
export async function getFileText(path: string): Promise<string> {
  const data = await gh(`/repos/${repo()}/contents/${encodeURI(path)}?ref=${branch()}`);
  return Buffer.from(data.content, "base64").toString("utf8");
}

/** Creates a single commit on the branch containing all file writes and deletions. */
export async function commitFiles(message: string, files: CommitFile[], deletions: string[] = []): Promise<string> {
  const r = repo();
  const ref = await gh(`/repos/${r}/git/ref/heads/${branch()}`);
  const headSha = ref.object.sha as string;
  const headCommit = await gh(`/repos/${r}/git/commits/${headSha}`);
  const baseTree = headCommit.tree.sha as string;

  const tree: { path: string; mode: string; type: string; sha: string | null }[] = await Promise.all(
    files.map(async (f) => {
      const blob = await gh(`/repos/${r}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: Buffer.isBuffer(f.content) ? f.content.toString("base64") : Buffer.from(f.content).toString("base64"),
          encoding: "base64",
        }),
      });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
    })
  );
  for (const path of deletions) {
    tree.push({ path, mode: "100644", type: "blob", sha: null }); // sha null = delete
  }

  const newTree = await gh(`/repos/${r}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });
  const commit = await gh(`/repos/${r}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  });
  await gh(`/repos/${r}/git/refs/heads/${branch()}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha as string;
}
