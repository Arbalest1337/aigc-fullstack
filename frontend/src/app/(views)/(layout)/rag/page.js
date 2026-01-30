'use client'
import { useState } from 'react'
import KnowledgeBase from './KnowledgeBase'
import Documents from './Documents'
import Chunks from './Chunks'
import Chat from './Chat'
export default function RagPage() {
  const [knowledgeBaseId, setKnowledgeBaseId] = useState('')
  const [documentId, setDocumentId] = useState('')

  return (
    <div className="flex gap-4">
      <div>
        <KnowledgeBase knowledgeBaseId={knowledgeBaseId} setKnowledgeBaseId={setKnowledgeBaseId} />
        <Chat knowledgeBaseId={knowledgeBaseId} />
      </div>

      <Documents
        knowledgeBaseId={knowledgeBaseId}
        documentId={documentId}
        setDocumentId={setDocumentId}
      />
      <Chunks documentId={documentId} />
    </div>
  )
}
