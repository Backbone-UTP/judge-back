const problemsRepository = require('./problems.repository');

const SHORT_DESCRIPTION_LENGTH = 150;

function toShortDescription(statement) {
    if (!statement) return '';
    const trimmed = statement.trim();
    return trimmed.length > SHORT_DESCRIPTION_LENGTH
    ? `${trimmed.slice(0, SHORT_DESCRIPTION_LENGTH)}...`
    : trimmed;
}

function toPublicProblem(row) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficulty: row.difficulty,
        short_description: toShortDescription(row.statement),
        acceptance_rate: null,
    };
}

async function listProblems() {
    const rows = await problemsRepository.findAllProblems();
    return rows.map(toPublicProblem);
}

module.exports = {
    listProblems,
};
