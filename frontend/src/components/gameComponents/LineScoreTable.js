function LineScoreTable({ game }) {
  return (
    <table className="line-score">
      <thead>
        <tr>
          <th>Team</th>
          <th>Q1</th>
          <th>Q2</th>
          <th>Q3</th>
          <th>Q4</th>
          <th>Total</th>
        </tr>
        <tr>
          <td>{game.home}</td>
          <td>{game.lineScore[game.home]["1Q"]}</td>
          <td>{game.lineScore[game.home]["2Q"]}</td>
          <td>{game.lineScore[game.home]["3Q"]}</td>
          <td>{game.lineScore[game.home]["4Q"]}</td>
          <td>{game.lineScore[game.home]["totalPts"]}</td>
        </tr>
        <tr>
          <td>{game.away}</td>
          <td>{game.lineScore[game.away]["1Q"]}</td>
          <td>{game.lineScore[game.away]["2Q"]}</td>
          <td>{game.lineScore[game.away]["3Q"]}</td>
          <td>{game.lineScore[game.away]["4Q"]}</td>
          <td>{game.lineScore[game.away]["totalPts"]}</td>
        </tr>
      </thead>
    </table>
  )
}

export default LineScoreTable
