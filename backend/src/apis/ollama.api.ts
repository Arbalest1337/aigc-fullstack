export const chatWithQwen3 = async ({ input, systemInstruction }) => {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3:1.7b',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: input }
      ],
      stream: true
    })
  })

  if (!res.ok) {
    console.log('error', await res.text())
  }

  return res
}
