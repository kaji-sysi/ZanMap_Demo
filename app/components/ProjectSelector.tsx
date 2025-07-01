'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project } from '@/app/types';
import { ChevronDown, Folder, X } from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectChange: (project: Project | null) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onProjectChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusColor = (status: Project['status']): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Project['status']): string => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'planning':
        return '計画中';
      case 'completed':
        return '完了';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Folder className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">
          {selectedProject ? selectedProject.name : 'すべてのプロジェクト'}
        </span>
        {selectedProject && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProjectChange(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1 max-h-64 overflow-y-auto">
            {/* すべてのプロジェクト */}
            <button
              onClick={() => {
                onProjectChange(null);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                !selectedProject ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4" />
                <span>すべてのプロジェクト</span>
              </div>
            </button>

            <div className="border-t border-gray-100"></div>

            {/* プロジェクトリスト */}
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  onProjectChange(project);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 ${
                  selectedProject?.id === project.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${
                        selectedProject?.id === project.id ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {project.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        進捗: {project.progress}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.manager}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {projects.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                プロジェクトがありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector; 