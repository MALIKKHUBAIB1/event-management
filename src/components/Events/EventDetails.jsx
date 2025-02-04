import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../utils/http.js";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, deleteEvent } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      console.log("Event deleted successfully, invalidating queries...");
      queryClient.invalidateQueries({
        queryKey: ["events", params.id],
        refetchType: "none",
      });
      navigate("/events"); // Navigate after query invalidation
    },
  });

  function onDelete() {
    mutate({ id: params.id });
  }

  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Loading...</p>
      </div>
    );
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to fetch Event Detail Page"
          message={error.info?.message || "Couldn't fetch data"}
        />
      </div>
    );
  }
  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      day: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={onDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      <article id="event-details">{content}</article>
    </>
  );
}
