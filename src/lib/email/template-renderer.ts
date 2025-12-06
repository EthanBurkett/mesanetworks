import {
  EmailTemplateQueries,
  type EmailTemplateVariables,
} from "@/lib/db/models/EmailTemplate.model";
import { Errors } from "@/lib/api-utils";

/**
 * Replace template variables in content
 * Variables use {{variableName}} syntax
 */
export function renderTemplate(
  content: string,
  variables: EmailTemplateVariables
): string {
  let rendered = content;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, value);
  }

  return rendered;
}

/**
 * Get a template by slug and render it with variables
 */
export async function getRenderedTemplate(
  slug: string,
  variables: EmailTemplateVariables
): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  const template = await EmailTemplateQueries.findBySlug(slug);

  if (!template) {
    throw new Errors.NotFound(`Email template '${slug}' not found`);
  }

  // Validate that all required variables are provided
  const missingVars = template.variables.filter(
    (varName) => !(varName in variables)
  );

  if (missingVars.length > 0) {
    throw new Errors.BadRequest(
      `Missing required variables: ${missingVars.join(", ")}`
    );
  }

  return {
    subject: renderTemplate(template.subject, variables),
    html: renderTemplate(template.htmlContent, variables),
    text: renderTemplate(template.textContent, variables),
  };
}

/**
 * Extract all variable names from a template string
 * Variables use {{variableName}} syntax
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g;
  const variables = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Validate template syntax and extract variables
 */
export function validateTemplate(
  subject: string,
  htmlContent: string,
  textContent: string
): {
  isValid: boolean;
  variables: string[];
  errors: string[];
} {
  const errors: string[] = [];

  // Extract variables from all content
  const subjectVars = extractVariables(subject);
  const htmlVars = extractVariables(htmlContent);
  const textVars = extractVariables(textContent);

  // Combine all unique variables
  const allVariables = Array.from(
    new Set([...subjectVars, ...htmlVars, ...textVars])
  );

  // Check if text content has variables that HTML doesn't (inconsistency warning)
  const textOnlyVars = textVars.filter((v) => !htmlVars.includes(v));
  if (textOnlyVars.length > 0) {
    errors.push(
      `Variables in text but not in HTML: ${textOnlyVars.join(", ")}`
    );
  }

  // Check if HTML has variables that text doesn't
  const htmlOnlyVars = htmlVars.filter((v) => !textVars.includes(v));
  if (htmlOnlyVars.length > 0) {
    errors.push(
      `Variables in HTML but not in text: ${htmlOnlyVars.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    variables: allVariables,
    errors,
  };
}
