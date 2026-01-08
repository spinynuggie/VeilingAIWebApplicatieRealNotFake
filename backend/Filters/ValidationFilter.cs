using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Filters
{
    public class ValidationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors)
                    .Select(x => x.ErrorMessage)
                    .ToList();

                var result = new
                {
                    success = false,
                    message = "Validatie fouten opgetreden.",
                    errors = errors
                };

                context.Result = new BadRequestObjectResult(result);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // No implementation needed
        }
    }
}
