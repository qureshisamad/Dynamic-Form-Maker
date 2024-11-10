import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AddFieldButton = ({ onAddField, parentId = null }) => {
  const FIELD_TYPES = {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number',
    DROPDOWN: 'dropdown',
    RADIO: 'radio',
    FILE: 'file',
    CHECKBOX: 'checkbox',
    COUNTRY: 'country',
    DATE: 'date',
    TIME: 'time',
    PHONE: 'phone',
    URL: 'url',
    SECTION: 'section',
    RATING: 'rating',
    SLIDER: 'slider'
  };

  // Field type groups for better organization
  const FIELD_GROUPS = {
    'Text Input': ['TEXT', 'TEXTAREA', 'EMAIL', 'PASSWORD', 'URL'],
    'Number Input': ['NUMBER', 'SLIDER', 'RATING'],
    'Choice Input': ['DROPDOWN', 'RADIO', 'CHECKBOX'],
    'Date & Time': ['DATE', 'TIME'],
    'Special Input': ['FILE', 'PHONE', 'COUNTRY'],
    'Layout': ['SECTION']
  };

  // Helper function to get a friendly display name for field types
  const getDisplayName = (type) => {
    const names = {
      TEXT: 'Text Input',
      TEXTAREA: 'Multi-line Text',
      EMAIL: 'Email Input',
      PASSWORD: 'Password Input',
      NUMBER: 'Number Input',
      DROPDOWN: 'Dropdown Select',
      RADIO: 'Radio Group',
      FILE: 'File Upload',
      CHECKBOX: 'Checkbox',
      COUNTRY: 'Country Select',
      DATE: 'Date Picker',
      TIME: 'Time Picker',
      PHONE: 'Phone Number',
      URL: 'URL Input',
      SECTION: 'Section Container',
      RATING: 'Rating Input',
      SLIDER: 'Slider Input'
    };
    return names[type] || type;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Object.entries(FIELD_GROUPS).map(([groupName, types]) => (
          <div key={groupName}>
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
              {groupName}
            </div>
            {types.map((type) => (
              <DropdownMenuItem
                key={type}
                className="cursor-pointer"
                onClick={() => onAddField(FIELD_TYPES[type], parentId)}
              >
                {getDisplayName(type)}
              </DropdownMenuItem>
            ))}
            {groupName !== 'Layout' && <div className="h-px my-1 bg-gray-200" />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { AddFieldButton};