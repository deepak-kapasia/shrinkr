interface ShortenResponse {
  shortUrl?: string;
  code?: string;
  error?: string;
}

const form = document.querySelector<HTMLFormElement>("#shorten-form");
const urlInput = document.querySelector<HTMLInputElement>("#url");
const aliasInput = document.querySelector<HTMLInputElement>("#alias");
const result = document.querySelector<HTMLParagraphElement>("#result");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!urlInput || !aliasInput || !result) return;

  result.className = "";
  result.textContent = "Creating link...";

  const body: { url: string; alias?: string } = { url: urlInput.value };
  if (aliasInput.value.trim() !== "") {
    body.alias = aliasInput.value.trim();
  }

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as ShortenResponse;

    if (!response.ok || !data.shortUrl) {
      throw new Error(data.error ?? "Could not create the short link.");
    }

    // Build the link with DOM methods instead of inserting API data as HTML.
    const link = document.createElement("a");
    link.href = data.shortUrl;
    link.textContent = data.shortUrl;
    result.replaceChildren("Your link: ", link);
  } catch (error) {
    result.className = "error";
    result.textContent = error instanceof Error ? error.message : "Something went wrong.";
  }
});
