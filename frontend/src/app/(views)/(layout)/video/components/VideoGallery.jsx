'use client'
import VideoActions from './VideoActions'
import VideoTask from './VideoTask/VideoTask'

export default function VideoGallery({ tasks, setTasks }) {
  return (
    <div className="h-full w-full p-4 overflow-y-auto">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 space-y-2">
        {tasks.map((item, index) => (
          <div
            key={item.taskId}
            className="group w-full h-auto break-inside-avoid overflow-hidden rounded-lg shadow-md"
          >
            <div className="w-full relative ">
              <VideoTask
                task={item}
                onUpdate={updated =>
                  setTasks(prev =>
                    prev.map(task => (task.taskId === updated.taskId ? updated : task))
                  )
                }
              />
              <VideoActions
                task={item}
                className="hidden group-hover:block"
                onRegenerated={newTask => setTasks(prev => [newTask, ...prev])}
                onDeleted={() => setTasks(prev => prev.filter(task => task.taskId !== item.taskId))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
