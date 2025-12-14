import { useState } from "react";
import {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
} from "@/lib/network-validator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  onClose: () => void;
  onHighlightNodes?: (nodeIds: string[]) => void;
  onHighlightEdges?: (edgeIds: string[]) => void;
}

export function ValidationPanel({
  validationResult,
  onClose,
  onHighlightNodes,
  onHighlightEdges,
}: ValidationPanelProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  if (!validationResult) return null;

  const toggleIssue = (issueId: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
    }
  };

  const handleHighlight = (issue: ValidationIssue) => {
    if (issue.affectedNodes && onHighlightNodes) {
      onHighlightNodes(issue.affectedNodes);
    }
    if (issue.affectedEdges && onHighlightEdges) {
      onHighlightEdges(issue.affectedEdges);
    }
  };

  const groupedIssues = validationResult.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, ValidationIssue[]>);

  return (
    <div className="w-96 h-full border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {validationResult.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          <h3 className="font-semibold">Network Validation</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={validationResult.isValid ? "default" : "destructive"}>
            {validationResult.isValid ? "Healthy" : "Issues Found"}
          </Badge>
        </div>
        <div className="flex gap-4 text-sm">
          {validationResult.summary.errors > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{validationResult.summary.errors} Errors</span>
            </div>
          )}
          {validationResult.summary.warnings > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <AlertTriangle className="w-4 h-4" />
              <span>{validationResult.summary.warnings} Warnings</span>
            </div>
          )}
          {validationResult.summary.info > 0 && (
            <div className="flex items-center gap-1 text-blue-500">
              <Info className="w-4 h-4" />
              <span>{validationResult.summary.info} Info</span>
            </div>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {validationResult.issues.length === 0 ? (
              <Card className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No issues found. Your network looks healthy!
                </p>
              </Card>
            ) : (
              Object.entries(groupedIssues).map(([category, issues]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    {category}
                  </h4>
                  {issues.map((issue) => {
                    const isExpanded = expandedIssues.has(issue.id);
                    return (
                      <Collapsible
                        key={issue.id}
                        open={isExpanded}
                        onOpenChange={() => toggleIssue(issue.id)}
                      >
                        <Card className="overflow-hidden">
                          <CollapsibleTrigger className="w-full">
                            <div className="p-3 flex items-start gap-3 hover:bg-accent transition-colors">
                              {getSeverityIcon(issue.severity)}
                              <div className="flex-1 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <h5 className="font-medium text-sm">
                                    {issue.title}
                                  </h5>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {issue.description.substring(0, 100)}
                                  {issue.description.length > 100 ? "..." : ""}
                                </p>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-3 pt-0 space-y-3 border-t">
                              <div>
                                <p className="text-sm">{issue.description}</p>
                              </div>
                              {issue.suggestion && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2">
                                  <p className="text-xs text-blue-700 dark:text-blue-400">
                                    <strong>Suggestion:</strong>{" "}
                                    {issue.suggestion}
                                  </p>
                                </div>
                              )}
                              {(issue.affectedNodes || issue.affectedEdges) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleHighlight(issue)}
                                >
                                  Highlight Affected Items
                                </Button>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
