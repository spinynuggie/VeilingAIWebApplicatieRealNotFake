namespace backend.Dtos
{
    /// <summary>
    /// Object dat de zoekparameters bevat voor het doorzoeken van het platform.
    /// </summary>
    public class SearchQueryDto
    {
        /// <summary>
        /// De zoekterm die wordt gebruikt om te filteren op namen of beschrijvingen.
        /// </summary>
        public string Query { get; set; }
    }
}