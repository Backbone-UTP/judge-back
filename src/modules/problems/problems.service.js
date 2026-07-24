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

//Aun no tengo claro que debe de ir en el campo de "author", por ahora solo devuelve null hasta consultar con el equipo
function toProblemDetail(row) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficulty: row.difficulty,
        statement: row.statement,
        examples: row.examples,
        constraints: row.constraints,
        acceptance_rate: null,
        author: null,
    };
}

async function listProblems() {
    const rows = await problemsRepository.findAllProblems();
    return rows.map(toPublicProblem);
}

async function getProblemDetail(id) {
    const row = await problemsRepository.findProblemById(id);
    if (!row) {
        return null;
    }
    return toProblemDetail(row);
}

module.exports = {
    listProblems,
    getProblemDetail,
};
