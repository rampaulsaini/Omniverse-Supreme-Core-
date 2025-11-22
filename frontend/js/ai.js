async function generateAI(prompt, sync=true){
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({prompt, max_tokens:300, mode: sync ? "sync" : "async"})
  });
  return res.json();
}

