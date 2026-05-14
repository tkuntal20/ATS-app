import { Octokit } from 'octokit';
import { formatJSONResult } from '../suggestions/formatter.js';
export async function pushToGitHub(resumePath, jdPath, score, suggestions, options) {
    const { token, owner, repo, branch = 'main' } = options;
    const octokit = new Octokit({ auth: token });
    // Create or get repository
    let repoExists = true;
    try {
        await octokit.rest.repos.get({ owner, repo });
    }
    catch (err) {
        if (err.status === 404) {
            repoExists = false;
            // Create repo
            await octokit.rest.repos.createForAuthenticatedUser({
                name: repo,
                description: 'ATS Resume Analysis Results',
                private: true,
                auto_init: true,
            });
            console.log(`Created new repository: ${owner}/${repo}`);
        }
        else {
            throw err;
        }
    }
    // Prepare analysis result
    const analysis = formatJSONResult(resumePath, jdPath, score, suggestions);
    const fileName = `ats-analysis-${new Date().getTime()}.json`;
    // Get current branch to commit to
    try {
        await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    }
    catch {
        // Branch doesn't exist, create it from main
        const mainRef = await octokit.rest.git.getRef({ owner, repo, ref: 'heads/main' });
        await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: mainRef.data.object.sha,
        });
    }
    // Get the latest commit on the branch
    const latestCommit = await octokit.rest.repos.getCommit({ owner, repo, ref: branch });
    const treeData = await octokit.rest.git.getTree({ owner, repo, tree_sha: latestCommit.data.commit.tree.sha });
    // Create blob for the analysis file
    const blob = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: JSON.stringify(analysis, null, 2),
        encoding: 'utf-8',
    });
    // Create tree with the new file
    const tree = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: latestCommit.data.commit.tree.sha,
        tree: [
            {
                path: `results/${fileName}`,
                mode: '100644',
                type: 'blob',
                sha: blob.data.sha,
            },
        ],
    });
    // Create commit
    const commit = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: `Add ATS analysis result: ${Math.round(score.score)}/100 score`,
        tree: tree.data.sha,
        parents: [latestCommit.data.sha],
    });
    // Update branch ref
    await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: commit.data.sha,
    });
    const repoUrl = `https://github.com/${owner}/${repo}`;
    const fileUrl = `${repoUrl}/blob/${branch}/results/${fileName}`;
    return {
        url: fileUrl,
        message: `✅ Analysis pushed to GitHub!\nRepository: ${repoUrl}\nBranch: ${branch}\nFile: results/${fileName}`,
    };
}
export async function validateGitHubToken(token) {
    try {
        const octokit = new Octokit({ auth: token });
        await octokit.rest.users.getAuthenticated();
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=uploader.js.map